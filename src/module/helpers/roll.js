import { clamp } from './math';

// #todo Need to change the roll formula for 6+ attr based on this PR (https://github.com/scrabbletank/farhome-rules/commit/3315fc480e9140112bef6d93efd49c65171ca9c7)

export function proficiencyRollFormula(proficiency, attribute) {
  const standardMaxDice = 5;

  // Figure out the max dice increase based on the attribute
  let maxDice = Math.max(standardMaxDice, attribute);

  // Calculate the maximum number of superior dice that can be converted
  let maxSuperior = clamp(attribute, 0, standardMaxDice);

  // Determine the number of superior dice based on the proficiency
  let superiorDice = Math.min(proficiency, maxSuperior);

  // Determine the number of enhanced dice based on the attribute and subtract those that have been converted to superior dice.
  let enhancedDice = Math.max(attribute, 0) - superiorDice;

  // Fill the remainder of the deice with normal dice up to the standard maximum and a minimum of 0.
  let normalDice = Math.max(standardMaxDice - (enhancedDice + superiorDice), 0);

  // Handle negative attributes
  let badDice = attribute < 0 ? Math.min(Math.abs(attribute), standardMaxDice) : 0;
  normalDice -= badDice;

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

  if (badDice > 0) {
    rollFormula += `${badDice}b`;
  }

  return rollFormula;
}

export function proficiencyRoll(roller, proficiency, attribute) {
  // #todo Likely need to add an actor activeEffectFormula to handle effects later.
  let rollFormula = proficiencyRollFormula(proficiency, attribute);
  return roller(rollFormula);
}
