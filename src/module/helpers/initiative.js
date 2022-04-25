import { proficiencyRollFormula } from './roll';

/**
 * Override the default Initiative formula to customize special behaviors of the system.
 * Apply advantage, proficiency, or bonuses where appropriate
 * Apply the dexterity score as a decimal tiebreaker if requested
 * See Combat._getInitiativeFormula for more detail.
 * @returns {string}  Final initiative formula for the actor.
 */
export const _getInitiativeFormula = function() {
  const actor = this.actor;
  if ( !actor ) return "1d20";

  let data = actor.data.data;
  let rollFormula = proficiencyRollFormula(0, data.attributes.dex.value);
  // TODO Split the roll here to get the value
  
  const parsedFormula = game.specialDiceRoller.fh.parsers[0].parse(rollFormula);
  const rolls = game.specialDiceRoller.fh.roll(parsedFormula);
  const rollValues = game.specialDiceRoller.fh.combineRolls(rolls);
  const formattedRoll = game.specialDiceRoller.fh.formatRolls(rolls, null);
  let results_html = `<h1>Initiative</h1>${formattedRoll}`;
  
  const rollMode = game.settings.get('core', 'rollMode');

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    content: results_html,
  };
  ChatMessage.applyRollMode(chatData, rollMode);
  var chatMessage = ChatMessage.create(chatData);

  let initiativeValue = rollValues.successes + (data.attributes.dex.value / 10.0);

  return `${initiativeValue}`;
};
