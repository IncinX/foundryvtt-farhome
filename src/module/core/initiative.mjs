import { proficiencyRollFormula } from './roll';
import { sendChatRoll } from '../roller/roller';

/**
 * Override the default Initiative formula to customize special behaviors of the system.
 * Apply advantage, proficiency, or bonuses where appropriate
 * Apply the dexterity score as a decimal tiebreaker if requested
 * See Combat._getInitiativeFormula for more detail.
 * @returns {string}  Final initiative formula for the actor.
 */
export function getInitiativeFormula() {
  const actor = this.actor;
  if (!actor) return '0';

  let rollFormula = proficiencyRollFormula(0, actor.system.attributes.dex.value);

  const parsedFormula = game.farhome.roller.parsers[0].parse(rollFormula);
  const rolls = game.farhome.roller.evaluateRolls(parsedFormula);
  const rollValues = game.farhome.roller.combineRolls(rolls);

  // Prepare a visual chat message for the roll to be done asynchronously
  // It is important to note that the getInitiativeFormula must be synchronous for foundry.
  game.farhome.roller.formatRolls(rolls).then(async (rollHtml) => {
    // Render the skill using the header-roll template
    const evaluatedRollHtml = await renderTemplate('systems/farhome/templates/chat/header-roll.hbs', {
      label: 'Initiative',
      roll: rollHtml,
    });

    // Send the chat roll for display (along with summary calculation, etc.)
    sendChatRoll(evaluatedRollHtml);
  });

  let initiativeValue = rollValues.successes + actor.system.attributes.dex.value / 10.0;

  return `${initiativeValue}`;
}
