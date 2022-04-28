import { evaluateTemplate } from '../helpers/template-evaluator';
import { convertSpellLevelToManaCost } from '../helpers/mana';

const MAX_SPELL_LEVEL = 10;

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class FarhomeItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();

    // Get the Item's data
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.data.data);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   */
  async roll() {
    const itemContext = this.data;

    if (itemContext.type === 'spell') {
      this._spellLevelDialog();
    } else {
      this._executeRoll();
    }
  }

  /**
   * Creates a dialog box to query the spell level from the user and pass it in the system context.
   * @param {Event} event   The originating click event
   * @private
   */
  async _spellLevelDialog() {
    const itemContext = this.data;

    let selectorUniqueId = `spell-level-selector-${Math.random().toString(16).substring(2)}`;

    let dialogContent = `<b>Select the level with which to cast the ${itemContext.name} spell.</b><br>`;
    dialogContent += `<select id="${selectorUniqueId}">`;
    for (let level = itemContext.data.spellLevel.value; level <= MAX_SPELL_LEVEL; level++) {
      if (level === 0) {
        dialogContent += '<option value="' + level + '">Cantrip</option>';
      } else {
        dialogContent += '<option value="' + level + '">Level ' + level + '</option>';
      }
    }
    dialogContent += '</select>';

    let d = new Dialog({
      title: 'Select Spell Level',
      content: dialogContent,
      buttons: {
        cast: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Cast',
          callback: () => {
            let castedSpellLevel = parseInt(document.getElementById(selectorUniqueId).value);
            let spellLevelDifference = castedSpellLevel - itemContext.data.spellLevel.value;
            this._executeRoll({ castedSpellLevel: castedSpellLevel, spellLevelDifference: spellLevelDifference });
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
        },
      },
      default: 'cast',
    });

    d.render(true);
  }

  /**
   * Execute a clickable roll by evaluating it's template and creating the chat message.
   * @param {Event} event   The originating click event
   * @private
   */
  async _executeRoll(extraItemContext = {}) {
    const actorContext = this.actor ? this.actor.data : null;
    let itemContext = this.data;

    // Add the extra item context which may have been queried by a user or inferred.
    var superItemContext = {
      ...itemContext,
      ...extraItemContext,
    };

    // Evaluate the template text with the given actor and item context.
    let evaluatedTemplate = evaluateTemplate(itemContext.data.rollTemplate.value, actorContext, superItemContext);

    // Create a mana spend button if the item is a spell.
    if (itemContext.type === 'spell') {
      let manaCost = convertSpellLevelToManaCost(extraItemContext.castedSpellLevel);
      let manaSpendHtml = `<form><button class="spend-mana" data-mana="${manaCost}">Spend Mana (${manaCost}/${actorContext.data.features.mana.max})</button></form>`;
      evaluatedTemplate += manaSpendHtml;
    }

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });

    // Roll mode controls what chat it goes to
    const rollMode = game.settings.get('core', 'rollMode');

    // Construct the chat message and send it
    let chatData = {
      user: game.user._id,
      speaker: speaker,
      content: evaluatedTemplate,
    };

    ChatMessage.applyRollMode(chatData, rollMode);
    ChatMessage.create(chatData);
  }
}
