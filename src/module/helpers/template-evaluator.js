import { proficiencyRollFormula } from './roll';

export function evaluateTemplate(templateString, actorData, itemData) {
  let evaluatedString = templateString;

  // Get a list of matches
  let pattern = /\[\[(.*?)\]\]/g;
  let rollChunks = templateString.match(pattern);

  if (rollChunks !== null) {
    // Iterate through the chunks and swap in the replacements
    for (const rollChunk of rollChunks) {
      // Strip the first two and last two characters (which represent [[]] based on the regular expression.)
      let strippedRollChunk = rollChunk.substring(2, rollChunk.length - 2);

      let rollChunkReplacement = evaluateRoll(strippedRollChunk, actorData, itemData);

      evaluatedString = evaluatedString.replace(rollChunk, rollChunkReplacement);
    }
  }

  return evaluatedString;
}

export function evaluateRoll(rollFormula, actorContext, itemContext) {
  let evaluatorFarhomeContext = {
    getRollFormula: proficiencyRollFormula, // TODO Come up with something more concise than this.
    r: game.specialDiceRoller.fh, // TODO This might need to be provided as a parameter for unit testing purposes?  Or perhaps I can mock it on the global level.
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
  };

  // TODO Add a help variable that when evaluated, prints the list of all functions and variables available.

  let evaluationFunction = Function('fh', 'a', 'i', 'return ' + rollFormula + ';');
  let evaluatedOutput = evaluationFunction(evaluatorFarhomeContext, evaluatorActorContext, evaluatorItemContext);

  return evaluatedOutput;
}
