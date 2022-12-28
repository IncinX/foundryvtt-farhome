import { proficiencyRollFormula } from '../core/roll';
import { getSpellPowerToMaxManaTable } from '../core/mana';

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class FarhomeActor extends Actor {
  /**
   * @inheritdoc
   * @override
   */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /**
   * @inheritdoc
   * @override
   */
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
    // Make separate methods for each Actor type (character, npc, etc.) to keep things organized.
    this._prepareActorBaseData();
    this._prepareCharacterData();
    this._prepareNpcData();
    this._prepareStashData();
  }

  /** @inheritdoc */
  _preCreate(data, options, user) {
    super._preCreate(data, options, user);

    // Configure prototype token settings
    if (this.type === 'character') {
      const prototypeToken = {
        vision: true,
        actorLink: true,
        disposition: 1,
      };

      this.updateSource({ prototypeToken });
    } else if (this.type === 'npc') {
      const prototypeToken = {
        dimSight: 30,
        brightSight: 15,
        vision: true,
        disposition: -1,
      };

      this.updateSource({ prototypeToken });
    }
  }

  /**
   * Prepare Actor general derived data
   */
  _prepareActorBaseData() {
    // Stash is special and isn't treated like a regular actor with base data.
    if (this.type === 'stash') return;

    // Calculate the max mana based on the spell power
    let spellPowerToManaTable = getSpellPowerToMaxManaTable();
    this.system.features.mana.max = spellPowerToManaTable[this.system.features.spellPower.value];

    // Loop through attribute scores, and add their roll string as derived this.system.
    // #todo This is not rollable today but may be in the future. Either remove this code or allow it to be rolled.
    for (let [_, attributeObject] of Object.entries(this.system.attributes)) {
      attributeObject.roll = proficiencyRollFormula(0, attributeObject.value);
    }

    // Loop through the saves, and add their roll string as derived this.system.
    // Note that according to the rules that negative attribute scores do not replace normal dice with bad dice.  Thereforce, clamp the lower bound to 0.
    for (let [attributeKey, proficiencyObject] of Object.entries(this.system.proficiencies.saves)) {
      proficiencyObject.roll = proficiencyRollFormula(
        proficiencyObject.value,
        Math.max(this.system.attributes[attributeKey].value, 0),
      );
    }

    // Loop through the attribute proficiencies, and add their roll string as derived this.system.
    for (let [attributeKey, attributeObject] of Object.entries(this.system.proficiencies.attributes)) {
      for (let [_, proficiencyObject] of Object.entries(attributeObject)) {
        proficiencyObject.attribute = game.i18n.localize(`farhome.${attributeKey}Tag`);
        proficiencyObject.roll = proficiencyRollFormula(
          proficiencyObject.value,
          this.system.attributes[attributeKey].value,
        );
      }
    }

    // Setup rolls for weapons
    // It uses the maximum of strength of dexterity for everything but ranged.
    const strongestStrDexTag =
      this.system.attributes.str.value > this.system.attributes.dex.value
        ? game.i18n.localize('farhome.strTag')
        : game.i18n.localize('farhome.dexTag');

    this.system.proficiencies.weapons.oneHand.attribute = strongestStrDexTag;
    this.system.proficiencies.weapons.oneHand.roll = proficiencyRollFormula(
      this.system.proficiencies.weapons.oneHand.value,
      Math.max(this.system.attributes.str.value, this.system.attributes.dex.value),
    );

    this.system.proficiencies.weapons.twoHand.attribute = strongestStrDexTag;
    this.system.proficiencies.weapons.twoHand.roll = proficiencyRollFormula(
      this.system.proficiencies.weapons.twoHand.value,
      Math.max(this.system.attributes.str.value, this.system.attributes.dex.value),
    );

    this.system.proficiencies.weapons.unarmed.attribute = strongestStrDexTag;
    this.system.proficiencies.weapons.unarmed.roll = proficiencyRollFormula(
      this.system.proficiencies.weapons.unarmed.value,
      Math.max(this.system.attributes.str.value, this.system.attributes.dex.value),
    );

    this.system.proficiencies.weapons.ranged.attribute = strongestStrDexTag;
    this.system.proficiencies.weapons.ranged.roll = proficiencyRollFormula(
      this.system.proficiencies.weapons.ranged.value,
      this.system.attributes.dex.value,
    );

    // Setup rolls for spells
    this.system.proficiencies.spells.arcane.attribute = game.i18n.localize('farhome.intTag');
    this.system.proficiencies.spells.arcane.roll = proficiencyRollFormula(
      this.system.proficiencies.spells.arcane.value,
      this.system.attributes.int.value,
    );

    this.system.proficiencies.spells.divine.attribute = game.i18n.localize('farhome.chaTag');
    this.system.proficiencies.spells.divine.roll = proficiencyRollFormula(
      this.system.proficiencies.spells.divine.value,
      this.system.attributes.cha.value,
    );

    this.system.proficiencies.spells.druidic.attribute = game.i18n.localize('farhome.willTag');
    this.system.proficiencies.spells.druidic.roll = proficiencyRollFormula(
      this.system.proficiencies.spells.druidic.value,
      this.system.attributes.will.value,
    );

    this.system.proficiencies.spells.elder.attribute = game.i18n.localize('farhome.staTag');
    this.system.proficiencies.spells.elder.roll = proficiencyRollFormula(
      this.system.proficiencies.spells.elder.value,
      this.system.attributes.sta.value,
    );

    this.system.proficiencies.spells.occult.attribute = game.i18n.localize('farhome.willTag');
    this.system.proficiencies.spells.occult.roll = proficiencyRollFormula(
      this.system.proficiencies.spells.occult.value,
      this.system.attributes.will.value,
    );

    // Setup rolls for tools
    this.system.proficiencies.tools.repairKit.attribute = game.i18n.localize('farhome.strTag');
    this.system.proficiencies.tools.repairKit.roll = proficiencyRollFormula(
      this.system.proficiencies.tools.repairKit.value,
      this.system.attributes.str.value,
    );

    this.system.proficiencies.tools.enchantersTools.attribute = game.i18n.localize('farhome.intTag');
    this.system.proficiencies.tools.enchantersTools.roll = proficiencyRollFormula(
      this.system.proficiencies.tools.enchantersTools.value,
      this.system.attributes.int.value,
    );

    this.system.proficiencies.tools.apothecarySet.attribute = game.i18n.localize('farhome.willTag');
    this.system.proficiencies.tools.apothecarySet.roll = proficiencyRollFormula(
      this.system.proficiencies.tools.apothecarySet.value,
      this.system.attributes.will.value,
    );

    this.system.proficiencies.tools.scribingTools.attribute = game.i18n.localize('farhome.intTag');
    this.system.proficiencies.tools.scribingTools.roll = proficiencyRollFormula(
      this.system.proficiencies.tools.scribingTools.value,
      this.system.attributes.int.value,
    );
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData() {
    if (this.type !== 'character') return;

    // Character specific derived data should be calculated here
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData() {
    if (this.type !== 'npc') return;

    // NPC specific derived data should be calculated here
  }

  /**
   * Prepare stash type specific data.
   */
  _prepareStashData() {
    if (this.type !== 'stash') return;

    // Stash specific derived data should be calculated here
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    let actorRollData = this._getActorRollData(data);
    let characterRollData = this._getCharacterRollData(data);
    let npcRollData = this._getNpcRollData(data);
    let stashRollData = this._getStashRollData(data);

    return {
      ...actorRollData,
      ...characterRollData,
      ...npcRollData,
      ...stashRollData,
    };
  }

  /**
   * Prepare generic actor roll data.
   */
  _getActorRollData(data) {
    // Generate a generic actor roll context and return it
    return {};
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return {};

    // Generate a character roll context and return it
    return {};
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return {};

    // Generate an NPC roll context and return it
    return {};
  }

  /**
   * Prepare stash roll data.
   */
  _getStashRollData(data) {
    if (this.type !== 'stash') return {};

    // Generate an stash roll context and return it
    return {};
  }
}
