import { proficiencyRollFormula } from './roll';

export function evaluateTemplate(templateString, context) {
  let farhomeContext = {
    roll: proficiencyRollFormula,
  }

  let actorContext = {
    dex: context.attributes.dex.value,
    acrobatics: context.proficiencies.dex.acrobatics.value,
  };

  let itemContext = {
    bonus: 's',
  }

  // TODO Need to get the text between the [[]], evaluate it and replace the whole [[]] expression.
  
  // TODO This is debug code to start off simple
  // TODO Can I change this to this?  Better yet, can I just refer to the variables directly?
  /* This Works
  let evaluationFunction = Function('d', 'return d.roll(d.acrobatics, d.dex);');
  let evaluatedOutput = evaluationFunction(evaluateContext);
  console.log(evaluatedOutput);
  */
  /* This Works
  let evaluationFunction = Function('return this.roll(this.acrobatics, this.dex);').bind(evaluateContext);
  let evaluatedOutput = evaluationFunction(evaluateContext);
  console.log(evaluatedOutput);
  */
  let evaluationFunction = Function('fh', 'a', 'i', 'return ' + 'fh.roll(a.acrobatics, a.dex) + i.bonus;');
  let evaluatedOutput = evaluationFunction(farhomeContext, actorContext, itemContext);
  console.log(evaluatedOutput);

  return evaluatedOutput;
}
