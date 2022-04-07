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
    getRollString: proficiencyRollFormula, // TODO Come up with something more concise than this.
    roll: game.specialDiceRoller.fh.rollFormula, // TODO This might need to be provided as a parameter for unit testing purposes?  Or perhaps I can mock it on the global level.
  };

  // TODO Add some more data related to the actor and item contexts that are relevant and important
  let evaluatorActorContext = {
    name: actorContext.name,
    dex: actorContext.data.attributes.dex.value,
    acrobatics: actorContext.data.proficiencies.dex.acrobatics.value,
  };

  let evaluatorItemContext = {
    name: itemContext.name,
    description: itemContext.name.description,
  };

  // TODO Need to get the text between the [[]], evaluate it and replace the whole [[]] expression.

  // TODO This is debug code to start off simple
  // TODO Can I change this to this?  Better yet, can I just refer to the variables directly?
  let evaluationFunction = Function('fh', 'a', 'i', 'return ' + rollFormula + ';');
  let evaluatedOutput = evaluationFunction(evaluatorFarhomeContext, evaluatorActorContext, evaluatorItemContext);
  console.log(evaluatedOutput);

  return evaluatedOutput;
}
