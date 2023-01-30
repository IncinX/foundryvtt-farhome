import { evaluateTemplate as evaluateRollTemplate } from '../core/template-evaluator';
import { convertSpellLevelToManaCost } from '../core/mana';
import { getEffectData, getEffectHtml } from '../core/effects';
import { sendChatRoll } from '../roller/roller';

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
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   */
  async roll() {
    if (this.type === 'spell') {
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
    // #todo Consider using renderTemplate instead of embedded HTML here and everywhere else that does so.
    const currentMana = this.actor ? this.actor.system.features.mana.value : 0;

    let selectorUniqueId = `spell-level-selector-${Math.random().toString(16).substring(2)}`;

    let dialogContent = `<p>${this.system.description.value}</p>`;

    dialogContent += `<p><b>Select the level with which to cast the spell</b></p>`;

    dialogContent += `<p><select id="${selectorUniqueId}" style="width: 100%">`;
    for (let level = this.system.spellLevel.value; level <= MAX_SPELL_LEVEL; level++) {
      if (level === 0) {
        dialogContent += `<option value="${level}">Cantrip</option>`;
      } else {
        const manaCost = convertSpellLevelToManaCost(level);
        dialogContent += `<option value="${level}">Level ${level} (Mana Cost = ${manaCost}/${currentMana})</option>`;
      }
    }
    dialogContent += '</select></p>';

    let manaDialog = new Dialog({
      title: ` ${this.name}: Select Spell Level`,
      content: dialogContent,
      buttons: {
        cast: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Cast',
          callback: () => {
            let castedSpellLevel = parseInt(document.getElementById(selectorUniqueId).value);
            let spellLevelDifference = castedSpellLevel - this.system.spellLevel.value;
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

    manaDialog.render(true);
  }

  /**
   * Execute a clickable roll by evaluating it's template and creating the chat message.
   * @param {object} extraItemContext Additional context to be passed to the template evaluation.
   * @private
   */
  async _executeRoll(extraItemContext = {}) {
    if (this.actor === undefined) {
      console.log('No actor found for this item.');
    }

    for (const prompt of this.system.prompts) {
      const promptValue = await this._promptDialog(prompt);

      extraItemContext[prompt.variable] = promptValue;
    }

    // #todo Handle prompts until complete and then complete roll.
    // #todo Change the mana dialog prompt to use the asynchronous callback pattern similar to _spellLevelDialog (if it works)

    await this._completeRoll(extraItemContext);
  }

  /**
   * Create a prompt dialog to select customer user values.
   * @param {object} prompt Prompt object with information about the title, description, variable and choices.
   * @private
   */
  async _promptDialog(prompt) {
    // #todo Consider using renderTemplate instead of embedded HTML here and everywhere else that does so.
    let selectorUniqueId = `prompt-selector-${Math.random().toString(16).substring(2)}`;

    let dialogContent = `<p>${this.system.description.value}</p>`;

    dialogContent += `<p><select id="${selectorUniqueId}" style="width: 100%">`;

    for (const choice of prompt.choices) {
      dialogContent += `<option value="${choice.value}">${choice.name}</option>`;
    }

    dialogContent += '</select></p>';

    let promptReturn = await Dialog.wait({
      title: prompt.title,
      content: dialogContent,
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Confirm',
          callback: () => {
            let selectedValue = parseInt(document.getElementById(selectorUniqueId).value);
            console.log(`DEBUG: selectedValue = ${selectedValue}`);
            return selectedValue;
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
        },
      },
      default: 'confirm',
    });

    console.log(`DEBUG: promptDialog = ${promptReturn}`);

    return promptReturn;
  }

  /**
   * Completes a clickable roll by evaluating it's template and creating the chat message.
   * @param {object} extraItemContext Additional context to be passed to the template evaluation.
   * @private
   */
  async _completeRoll(extraItemContext = {}) {
    // #todo Handle prompts until complete and then complete roll.

    // Add the extra item context which may have been queried by a user or inferred.
    var superItemContext = {
      ...this,
      ...extraItemContext,
    };

    // Evaluate the farhome template text with the given actor and item context.
    const evaluatedRollHtml = await evaluateRollTemplate(this.system.rollTemplate.value, this.actor, superItemContext);

    // Evaluate the active effects for the character (ie/ hex, poison, etc)
    const activeEffectData = getEffectData(this.actor);
    const activeEffectsHtml = await getEffectHtml(activeEffectData);

    // Evaluate mana data if it is a spell
    let manaData = undefined;
    if (this.type === 'spell') {
      let manaCost = convertSpellLevelToManaCost(extraItemContext.castedSpellLevel);
      manaData = {
        actorId: this.actor._id,
        manaCost: manaCost,
        availableMana: this.actor.system.features.mana.value,
      };
    }

    // Send the chat roll with the appropriate data
    sendChatRoll(evaluatedRollHtml, activeEffectsHtml, manaData);
  }
}
