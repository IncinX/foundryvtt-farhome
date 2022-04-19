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
    const actorContext = this.actor ? this.actor.data : null;
    const itemContext = this.data;

    let evaluatedTemplate = evaluateTemplate(itemContext.data.rollTemplate.value, actorContext, itemContext);

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });

    // Roll mode controls what chat it goes to
    const rollMode = game.settings.get('core', 'rollMode');

    ChatMessage.create({
      user: game.user._id,
      speaker: speaker,
      rollMode: rollMode,
      content: evaluatedTemplate,
    });
  }
}
