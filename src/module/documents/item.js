import { evaluateTemplate } from '../helpers/template-evaluator';

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

    // TODO Add custom rollable stuff here and prepare functions to set up the rollables.
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
   * @private
   */
  async roll() {
    const actorContext = this.actor.data;
    const itemContext = this.data;

    let evaluatedTemplate = evaluateTemplate(itemContext.data.rollTemplate, actorContext, itemContext);
    console.log(evaluatedTemplate);

    // TODO Look into Roll.replaceFormulaData() and foundry.utils.getProperty as a way to replace context data from the actor and items.
    //      Use this as a means to build embedded descriptions for auto-rolling.

    // TODO The available data for embedded descriptions should be the actor data as well as the item data. (probably referenced like actor.dex.roll and item.bonus.roll)

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });

    // TODO What should I put here?
    //const rollMode = game.settings.get('core', 'rollMode');

    ChatMessage.create({
      user: game.user._id,
      speaker: speaker,
      content: evaluatedTemplate,
      //rollMode: rollMode,
    });
  }
}
