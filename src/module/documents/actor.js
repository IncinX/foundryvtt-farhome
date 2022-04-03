// TODO Add facilities to potentially calculate spell power

import { clamp } from '../helpers/math';

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
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // TODO Move all this to somethign like _prepareActorData that is common to all actors (the roll stuff definitely should be)

    // Make modifications to data here. For example:
    const data = actorData.data;

    // Loop through attribute scores, and add their roll string as derived data.
    for (let [key, attribute] of Object.entries(data.attributes)) {
      attribute.roll = "";

      // TODO Can I somehow make this into a helper method that accepts superior, proficient and normal dice?
      let enhancedDice = clamp(attribute.value, 0, 5);
      let normalDice = 5 - enhancedDice;

      if (enhancedDice > 0) {
        attribute.roll += `${enhancedDice}e`;
      }
      if (normalDice > 0) {
        attribute.roll += `${normalDice}n`;
      }
    }

    // Loop through the saves, and add their roll string as derived data.
    for (let [key, proficiency] of Object.entries(data.proficiencies.saves)) {
      proficiency.roll = "";

      // TODO Can I somehow make this into a helper method that accepts superior, proficient and normal dice?
      //      This should cleanup this code and the code below.  Put it in math.js
      
      // TODO Can we shorten this?
      let attribute = data.attributes[key];
      let enhancedDice = clamp(attribute.value, 0, 5);
      let superiorDice = clamp(proficiency.value, 0, enhancedDice);
      enhancedDice -= superiorDice;
      let normalDice = 5 - (enhancedDice + superiorDice);

      if (superiorDice > 0) {
        proficiency.roll += `${superiorDice}s`;
      }
      if (enhancedDice > 0) {
        proficiency.roll += `${enhancedDice}e`;
      }
      if (normalDice > 0) {
        proficiency.roll += `${normalDice}n`;
      }
    }
    
    // TODO Add roll strings for all proficiencies.

    /* TODO This doesn't apply to farhome but I can extend it to something similar later.
    for (let [key, attribute] of Object.entries(data.attributes)) {
      // Calculate the modifier using d20 rules.
      attribute.mod = Math.floor((attribute.value - 10) / 2);
    }
    */
    // TODO Create roll formula's for @str.roll as an example to be "ssspn"
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const data = actorData.data;
    /** TODO Not useful right now but it could be useful later./
    data.xp = (data.cr * data.cr) * 100;
    */
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
