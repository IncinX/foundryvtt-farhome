import { evaluateTemplate } from '../helpers/template-evaluator';
import { convertSpellLevelToManaCost } from '../helpers/mana';
import { sendActorMessage } from '../helpers/chat';

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
    const actorContext = this.actor ? this.actor.data : null;
    const currentMana = actorContext ? actorContext.data.features.mana.value : 0;

    let selectorUniqueId = `spell-level-selector-${Math.random().toString(16).substring(2)}`;

    let dialogContent = `<p>${itemContext.data.description.value}</p>`;

    dialogContent += `<p><b>Select the level with which to cast the spell</b></p>`;

    dialogContent += `<p><select id="${selectorUniqueId}" style="width: 100%">`;
    for (let level = itemContext.data.spellLevel.value; level <= MAX_SPELL_LEVEL; level++) {
      if (level === 0) {
        dialogContent += `<option value="${level}">Cantrip</option>`;
      } else {
        const manaCost = convertSpellLevelToManaCost(level);
        dialogContent += `<option value="${level}">Level ${level} (Mana Cost = ${manaCost}/${currentMana})</option>`;
      }
    }
    dialogContent += '</select></p>';

    let d = new Dialog({
      title: ` ${itemContext.name}: Select Spell Level`,
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
    if (itemContext.type === 'spell' && actorContext !== null) {
      let manaCost = convertSpellLevelToManaCost(extraItemContext.castedSpellLevel);
      let manaSpendHtml = `
        <form>
          <button class="spend-mana" data-mana="${manaCost}" data-actor-id="${actorContext._id}">Spend Mana (${manaCost}/${actorContext.data.features.mana.value})</button>
        </form>`;
      evaluatedTemplate += manaSpendHtml;
    }

    // Send the evaluatedTemplate to chat.
    sendActorMessage(this.actor, evaluatedTemplate);
  }

  /**
   * Opportunity to subscribe to chat log events.
   * @param {Document} html   The html document for the chat log.
   * @private
   */
  static _subscribeToChatLog(html) {
    html.on('click', '.spend-mana', this._handleManaSpend.bind(this));
  }

  /**
   * Handle click message generated from the "Spend Mana" button in chat.
   * @param {Event} event   The originating click event
   * @private
   */
  static async _handleManaSpend(event) {
    event.preventDefault();

    // Disable the button
    event.currentTarget.disabled = true;

    // Get the data from the button
    let manaCost = parseInt(event.currentTarget.dataset.mana);
    let actorId = event.currentTarget.dataset.actorId;

    // Check for ownership
    let actor = game.actors.get(actorId);
    if (!actor.isOwner) {
      sendActorMessage(
        actor,
        'You do not own this actor, so stop trying to spend their mana. ' +
          'They are <i>probably</i> competant enough to do that themselves.',
      );
      return;
    }

    // Dedudct the mana off of the character's sheet
    actor.update({ 'data.features.mana.value': actor.data.data.features.mana.value - manaCost });

    // Send the confirmation message to the chat
    sendActorMessage(actor, `<b>${actor.name}</b> spent ${manaCost} mana.`);
  }
}
