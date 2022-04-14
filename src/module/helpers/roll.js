import { clamp } from './math';

export function proficiencyRollFormula(proficiency, attribute) {
  const standardMaxDice = 5;
  let maxDice = Math.max(standardMaxDice, attribute);
  let maxSuperior = clamp(attribute, 0, standardMaxDice);
  let superiorDice = Math.min(proficiency, maxSuperior);
  let extraEnhanced = maxDice > standardMaxDice ? Math.max(proficiency - standardMaxDice, 0) : 0;
  let enhancedDice = clamp(attribute, 0, standardMaxDice) - superiorDice + extraEnhanced;
  let normalDice = maxDice - (enhancedDice + superiorDice);

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
