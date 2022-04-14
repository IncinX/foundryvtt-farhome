import { proficiencyRollFormula } from './roll';

export function evaluateTemplate(templateString, actorContext, itemContext) {
  let evaluatedString = templateString;

  // Get a list of matches
  let pattern = /\[\[(.*?)\]\]/g;
  let templateChunks = templateString.match(pattern);

  if (templateChunks !== null) {
    // Iterate through the chunks and swap in the replacements
    for (const templateChunk of templateChunks) {
      // Strip the first two and last two characters (which represent [[]] based on the regular expression.)
      let strippedRollChunk = templateChunk.substring(2, templateChunk.length - 2);

      let rollChunkReplacement = evaluateTemplateChunk(strippedRollChunk, actorContext, itemContext);

      evaluatedString = evaluatedString.replace(templateChunk, rollChunkReplacement);
    }
  }

  return evaluatedString;
}

export function evaluateTemplateChunk(templateChunk, actorContext, itemContext) {
  let evaluatorRollerContext = game.specialDiceRoller.fh;

  let evaluatorSystemContext = {
    getRollFormula: proficiencyRollFormula,
  };

  // TODO Try to automate this with some loops but still keep the concise syntax?
  let evaluatorActorContext = {
    name: actorContext.name,

    str: actorContext.data.attributes.str.value,
    dex: actorContext.data.attributes.dex.value,
    sta: actorContext.data.attributes.sta.value,
    int: actorContext.data.attributes.int.value,
    will: actorContext.data.attributes.will.value,
    cha: actorContext.data.attributes.cha.value,

    strSave: actorContext.data.proficiencies.saves.str.value,
    dexSave: actorContext.data.proficiencies.saves.dex.value,
    staSave: actorContext.data.proficiencies.saves.sta.value,
    intSave: actorContext.data.proficiencies.saves.int.value,
    willSave: actorContext.data.proficiencies.saves.will.value,
    chaSave: actorContext.data.proficiencies.saves.cha.value,

    athletics: actorContext.data.proficiencies.attributes.str.athletics.value,
    intimidation: actorContext.data.proficiencies.attributes.str.intimidation.value,

    acrobatics: actorContext.data.proficiencies.attributes.dex.acrobatics.value,
    lockpicking: actorContext.data.proficiencies.attributes.dex.lockpicking.value,
    stealth: actorContext.data.proficiencies.attributes.dex.stealth.value,
    sleightOfHand: actorContext.data.proficiencies.attributes.dex.sleightOfHand.value,

    exhaustion: actorContext.data.proficiencies.attributes.sta.exhaustion.value,
    survival: actorContext.data.proficiencies.attributes.sta.survival.value,

    arcana: actorContext.data.proficiencies.attributes.int.arcana.value,
    investigation: actorContext.data.proficiencies.attributes.int.investigation.value,
    lore: actorContext.data.proficiencies.attributes.int.lore.value,
    medicine: actorContext.data.proficiencies.attributes.int.medicine.value,

    animalHandling: actorContext.data.proficiencies.attributes.will.animalHandling.value,
    insight: actorContext.data.proficiencies.attributes.will.insight.value,
    nature: actorContext.data.proficiencies.attributes.will.nature.value,
    perception: actorContext.data.proficiencies.attributes.will.perception.value,

    conversation: actorContext.data.proficiencies.attributes.cha.conversation.value,
    diplomacy: actorContext.data.proficiencies.attributes.cha.diplomacy.value,
    performance: actorContext.data.proficiencies.attributes.cha.performance.value,
    religion: actorContext.data.proficiencies.attributes.cha.religion.value,

    oneHand: actorContext.data.proficiencies.weapons.oneHand.value,
    twoHand: actorContext.data.proficiencies.weapons.twoHand.value,
    ranged: actorContext.data.proficiencies.weapons.ranged.value,
    unarmed: actorContext.data.proficiencies.weapons.unarmed.value,

    arcane: actorContext.data.proficiencies.spells.arcane.value,
    blood: actorContext.data.proficiencies.spells.blood.value,
    curse: actorContext.data.proficiencies.spells.curse.value,
    divine: actorContext.data.proficiencies.spells.divine.value,
    druidic: actorContext.data.proficiencies.spells.druidic.value,

    repairKit: actorContext.data.proficiencies.tools.repairKit.value,
    enchantersTools: actorContext.data.proficiencies.tools.enchantersTools.value,
    apothecarySet: actorContext.data.proficiencies.tools.apothecarySet.value,
    scribingTools: actorContext.data.proficiencies.tools.scribingTools.value,
  };

  let evaluatorItemContext = {
    name: itemContext.name,
    description: itemContext.data.description.value,
    rarity: itemContext.data.rarity ? itemContext.data.rarity.value : '',
    apCost: itemContext.data.apCost ? itemContext.data.apCost.value : '',
    range: itemContext.data.range ? itemContext.data.range.value : '',
    damageType: itemContext.data.damageType ? itemContext.data.damageType.value : '',
    quantity: itemContext.data.quantity ? itemContext.data.quantity.value : '',
    weight: itemContext.data.weight ? itemContext.data.weight : '',
    weaponType: itemContext.data.weaponType ? itemContext.data.weaponType.value : '',
    armorBonus: itemContext.data.armorBonus ? itemContext.data.armorBonus.value : '',
    armorPenalty: itemContext.data.armorPenalty ? itemContext.data.armorPenalty.value : '',
    armorType: itemContext.data.armorType ? itemContext.data.armorType.value : '',
    levelRequirements: itemContext.data.levelRequirements ? itemContext.data.levelRequirements.value : '',
    apCosts: itemContext.data.apCosts ? itemContext.data.apCosts.value : '',
    spellLevel: itemContext.data.spellLevel ? itemContext.data.spellLevel.value : '',
    spellSchool: itemContext.data.spellSchool ? itemContext.data.spellSchool.value : '',
    spellDuration: itemContext.data.duration ? itemContext.data.duration.value : '',
    castingTime: itemContext.data.castingTime ? itemContext.data.castingTime.value : '',
    areaOfEffect: itemContext.data.areaOfEffect ? itemContext.data.areaOfEffect.value : '',
  };

  // Build the help text
  let help = '<b>r (roll context):</b><br/>';
  help += '<ul>';
  help += '<li>rollFormula(formulaString)</li><br/>';
  help += '</ul>';

  help += '<b>s (system context):</b><br/>';
  help += '<ul>';
  help += '<li>getRollFormula(proficiency, attribute)</li><br/>';
  help += '</ul>';

  help += '<b>a (actor context):</b><br/>';
  help += '<ul>';
  for (const [key, value] of Object.entries(evaluatorActorContext)) {
    help += `<li>${key}</li><br/>`;
  }
  help += '</ul>';

  help += '<b>i (item context):</b><br/>';
  help += '<ul>';
  for (const [key, value] of Object.entries(evaluatorItemContext)) {
    help += `<li>${key}</li><br/>`;
  }
  help += '</ul>';

  // Evaluate the template chunk
  let evaluationFunction = Function('fh', 's', 'a', 'i', 'help', 'return ' + templateChunk + ';');
  let evaluatedOutput = evaluationFunction(
    evaluatorRollerContext,
    evaluatorSystemContext,
    evaluatorActorContext,
    evaluatorItemContext,
    help,
  );

  return evaluatedOutput;
}
