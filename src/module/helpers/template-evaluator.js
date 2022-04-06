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

export function evaluateRoll(rollFormula, actorData, itemData) {
  let farhomeContext = {
    getRollString: proficiencyRollFormula, // TODO Come up with something more concise than this.
    roll: function (string) {
      // TODO Change this to the fh.Roll function provided by the special dice roller.
      return string;
    },
  };

  // TODO Add some more data related to the actor and item contexts that are relevant and important
  let actorContext = {
    dex: actorData.attributes.dex.value,
    acrobatics: actorData.proficiencies.dex.acrobatics.value,
  };

  let itemContext = {
    name: 'Test Item Name',
    description: 'Test Item Description', // TODO Fill this with the item description
  };

  // TODO Need to get the text between the [[]], evaluate it and replace the whole [[]] expression.

  // TODO This is debug code to start off simple
  // TODO Can I change this to this?  Better yet, can I just refer to the variables directly?
  let evaluationFunction = Function(
    'fh',
    'a',
    'i',
    'return ' + 'fh.roll(fh.getRollString(a.acrobatics, a.dex) + "s");',
  );
  let evaluatedOutput = evaluationFunction(farhomeContext, actorContext, itemContext);
  console.log(evaluatedOutput);

  return evaluatedOutput;
}
