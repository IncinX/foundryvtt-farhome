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
    let extraItemContext = {};
    let promptContext = {};

    if (this.type === 'spell') {
      // Add spell dialog context to the extra item context.
      Object.assign(extraItemContext, await this._spellLevelDialog());
    }

    // Process prompts and add them to the item context.
    // #todo This prompt stuff should be put into a Prompt class with helper methods that include iteration.
    const promptMaxIndex = this.system.prompts.maxIndex ?? 0;
    for (let promptIndex = 0; promptIndex < promptMaxIndex; promptIndex++) {
      let prompt = this.system.prompts[`${promptIndex}`];
      if (prompt.isValid) {
        const promptResult = await this._promptDialog(prompt);

        promptContext[prompt.variable.value] = promptResult;
      }
    }

    await this._executeRoll(extraItemContext, promptContext);
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

    const extraItemContext = await Dialog.wait({
      title: ` ${this.name}: Select Spell Level`,
      content: dialogContent,
      buttons: {
        cast: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Cast',
          callback: () => {
            const castedSpellLevel = parseInt(document.getElementById(selectorUniqueId).value);
            const spellLevelDifference = castedSpellLevel - this.system.spellLevel.value;
            const extraItemContext = {
              castedSpellLevel: castedSpellLevel,
              spellLevelDifference: spellLevelDifference,
            };
            return extraItemContext;
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
        },
      },
      default: 'cast',
    });

    return extraItemContext;
  }

  /**
   * Create a prompt dialog to select customer user values.
   * @param {object} prompt Prompt object with information about the title, description, variable and choices.
   * @private
   */
  async _promptDialog(prompt) {
    // #todo Consider using renderTemplate instead of embedded HTML here and everywhere else that does so.
    let selectorUniqueId = `prompt-selector-${Math.random().toString(16).substring(2)}`;

    let dialogContent = `<p>${prompt.description.value}</p>`;

    dialogContent += `<p><select id="${selectorUniqueId}" style="width: 100%">`;

    for (const choice of prompt.choices) {
      dialogContent += `<option value="${choice.variableValue.value}">${choice.name.value}</option>`;
    }

    dialogContent += '</select></p>';

    let promptReturn = await Dialog.wait({
      title: prompt.title.value,
      content: dialogContent,
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Confirm',
          callback: () => {
            return parseInt(document.getElementById(selectorUniqueId).value);
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
        },
      },
      default: 'confirm',
    });

    return promptReturn;
  }

  /**
   * Execute a clickable roll by evaluating it's template and creating the chat message.
   * @param {object} extraItemContext Additional context to be passed to the template evaluation.
   * @private
   */
  async _executeRoll(extraItemContext = {}, promptContext = {}) {
    if (this.actor === undefined) {
      console.log('No actor found for this item.');
    }

    // Add the extra item context which may have been queried by a user or inferred.
    var superItemContext = {
      ...this,
      ...extraItemContext,
    };

    // Evaluate the farhome template text with the given actor and item context.
    const evaluatedRollHtml = await evaluateRollTemplate(
      this.system.rollTemplate.value,
      this.actor,
      superItemContext,
      promptContext,
    );

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

    // Provide AP context data. The ap cost will be evaluated in sendChatRoll.
    let apData = {
      actorId: this.actor._id,
      availableAP: this.actor.system.features.ap.value,
    };

    // Send the chat roll with the appropriate data
    sendChatRoll(evaluatedRollHtml, activeEffectsHtml, {
      manaData: manaData,
      apData: apData,
      healingSurgeData: undefined,
    });
  }
}
