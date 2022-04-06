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

    // Setup rolls for spells
    data.proficiencies.spells.arcane.roll = proficiencyRollFormula(
      data.proficiencies.spells.arcane.value,
      data.attributes.int.value,
    );
    data.proficiencies.spells.curse.roll = proficiencyRollFormula(
      data.proficiencies.spells.curse.value,
      data.attributes.will.value,
    );
    data.proficiencies.spells.divine.roll = proficiencyRollFormula(
      data.proficiencies.spells.divine.value,
      data.attributes.cha.value,
    );
    data.proficiencies.spells.druidic.roll = proficiencyRollFormula(
      data.proficiencies.spells.druidic.value,
      data.attributes.will.value,
    );

    // Setup rolls for tools
    data.proficiencies.tools.repairKit.roll = proficiencyRollFormula(
      data.proficiencies.tools.repairKit.value,
      data.attributes.str.value,
    );
    data.proficiencies.tools.enchantersTools.roll = proficiencyRollFormula(
      data.proficiencies.tools.enchantersTools.value,
      data.attributes.int.value,
    );
    data.proficiencies.tools.apothecarySet.roll = proficiencyRollFormula(
      data.proficiencies.tools.apothecarySet.value,
      data.attributes.will.value,
    );
    data.proficiencies.tools.scribingTools.roll = proficiencyRollFormula(
      data.proficiencies.tools.scribingTools.value,
      data.attributes.int.value,
    );
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
    let actorRollData = this._getCharacterRollData(data);
    let characterRollData = this._getCharacterRollData(data);
    let npcRollData = this._getNpcRollData(data);

    return {
      ...actorRollData,
      ...characterRollData,
      ...npcRollData,
    };
  }

  /**
   * Prepare generic actor roll data.
   */
  _getCharacterRollData(data) {
    // Generate a generic actor roll context and return it
    return {};
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.data.type !== 'character') return {};

    // Generate a character roll context and return it
    return {};
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.data.type !== 'npc') return {};

    // Generate an NPC roll context and return it
    return {};
  }
}
