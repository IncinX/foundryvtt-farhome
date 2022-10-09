import { proficiencyRollFormula } from './roll';
import { sendActorMessage } from './chat';

/**
 * Override the default Initiative formula to customize special behaviors of the system.
 * Apply advantage, proficiency, or bonuses where appropriate
 * Apply the dexterity score as a decimal tiebreaker if requested
 * See Combat._getInitiativeFormula for more detail.
 * @returns {string}  Final initiative formula for the actor.
 */
export const _getInitiativeFormula = function () {
  const actor = this.actor;
  if (!actor) return '0';

  let data = actor.data.data;
  let rollFormula = proficiencyRollFormula(0, data.attributes.dex.value);

  const parsedFormula = game.farhome.roller.parsers[0].parse(rollFormula);
  const rolls = game.farhome.roller.roll(parsedFormula);
  const rollValues = game.farhome.roller.combineRolls(rolls);
  const formattedRoll = game.farhome.roller.formatRolls(rolls, null, false, false);

  sendActorMessage(`<h1>Initiative</h1>${formattedRoll}`);

  let initiativeValue = rollValues.successes + data.attributes.dex.value / 10.0;

  return `${initiativeValue}`;
};
