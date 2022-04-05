// TODO Add facilities to potentially calculate spell power

import { clamp } from '../helpers/math';
import { proficiencyRollFormula } from '../helpers/roll';

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class FarhomeActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.farhome || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareActorData(actorData);
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Actor general derived data data
   */
  _prepareActorData(actorData) {
    const data = actorData.data;

    // Loop through attribute scores, and add their roll string as derived data.
    for (let [_, attributeObject] of Object.entries(data.attributes)) {
      attributeObject.roll = proficiencyRollFormula(0, attributeObject.value);
    }

    // Loop through the saves, and add their roll string as derived data.
    for (let [attributeKey, proficiencyObject] of Object.entries(data.proficiencies.saves)) {
      proficiencyObject.roll = proficiencyRollFormula(proficiencyObject.value, data.attributes[attributeKey].value);
    }

    // Loop through the attribute proficiencies, and add their roll string as derived data.
    for (let [attributeKey, attributeObject] of Object.entries(data.proficiencies.attributes)) {
      for (let [_, proficiencyObject] of Object.entries(attributeObject)) {
        proficiencyObject.roll = proficiencyRollFormula(proficiencyObject.value, data.attributes[attributeKey].value);
      }
    }

    // TODO Add the roll strings for spells and tools too.  (The weapon roll depends on the attribute which is unknown at this point.)
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const data = actorData.data;

    // Character specific derived data should be calculated here
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    const data = actorData.data;

    // NPC specific derived data should be calculated here
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.data.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    // TODO This doesn't apply to farhome but I can extend it to something similar later.
    /*
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.attributes)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.essence.level) {
      data.lvl = data.essence.level.value ?? 0;
    }
    */
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.data.type !== 'npc') return;

    // Process additional NPC data here.
  }
}
