// TODO Add some unit tests for all of this.  Handle a lot of the different cases.
import { clamp } from './math';

export function proficiencyRollFormula(proficiency, attribute) {
  // TODO There is a bug with attribute 6, proficiency 1.  There should be 1 yellow, 4 green, 1 white. But it's not.
  // TODO Same bug with attribute 6, profiency 5.  There should be 5 yellow, 1 white.  But it's not.

  const standardMaxDice = 5;
  let maxDice = Math.max(standardMaxDice, attribute);
  let maxSuperior = clamp(attribute, 0, standardMaxDice);
  let superiorDice = Math.min(proficiency, maxSuperior);
  let enhancedDice = clamp(attribute, 0, maxDice) - superiorDice;
  let normalDice = maxDice - (enhancedDice + superiorDice);

  let rollFormula = '';

  if (superiorDice > 0) {
    rollFormula += `${superiorDice}s`;
  }

  if (enhancedDice > 0) {
    rollFormula += `${enhancedDice}e`;
  }

  if (normalDice > 0) {
    rollFormula += `${normalDice}n`;
  }

  return rollFormula;
}
