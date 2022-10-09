// #todo Rename this to something better
// #todo Add function/class documentation for all the code in farhome
// #todo Clean up all the code
// #todo Cleanup the import dependencies, avoid ciruclar dependencies
import Mustache from 'mustache';
import { ReRoll } from './roller-roll';
import { Roll } from './roller-roll';
import { summaryTemplate } from './roller-templates';

// #todo Consider putting all this stuff inside the FHSystem class

export function parseRoll(input) {
  const die = parseInt(input.dataset.die ?? '0', 10);
  const face = parseInt(input.dataset.face ?? '0', 10);
  return new Roll(die, face);
}

function renderNewRoll(rolls) {
  const chatData = {
    user: game.user.id,
    content: rolls,
  };
  ChatMessage.create(chatData, { displaySheet: false });
}

export function getRollSummaryData(rollHtml) {
  const fhRollQuery = $(rollHtml);

  let rolls = [];
  let containsRollData = false;

  fhRollQuery.find('input').each((_index, element) => {
    containsRollData = true;

    if (!element.disabled) {
      const rollData = parseRoll(element);
      rolls.push(rollData);
    }
  });

  const initialRollSummaryData = game.farhome.roller.combineRolls(rolls);

  // Compute the roll modifiers
  let rollModifiersData = {
    containsRollData: containsRollData,
    successes: initialRollSummaryData.successes,
    crits: initialRollSummaryData.crits,
    wounds: initialRollSummaryData.wounds,
    hex: 0,
    poison: 0,
  };

  // #todo These hard-coded class strings should be communicated through const static exports (possibly from a class)

  fhRollQuery.find('.fh-successes').each((_index, element) => {
    rollModifiersData.successes += parseInt(element.dataset.successes);
  });

  fhRollQuery.find('.fh-crits').each((_index, element) => {
    rollModifiersData.crits += parseInt(element.dataset.crits);
  });

  fhRollQuery.find('.fh-wounds').each((_index, element) => {
    rollModifiersData.wounds += parseInt(element.dataset.wounds);
  });

  fhRollQuery.find('.fh-hex').each((_index, element) => {
    rollModifiersData.hex += parseInt(element.dataset.hex);
  });

  fhRollQuery.find('.fh-poison').each((_index, element) => {
    rollModifiersData.poison += parseInt(element.dataset.poison);
  });

  // #todo Do hex and poison later when active effects are in.
  // #todo Apply hex modifiers
  // #todo Roll and apply poison modifiers... Where to make those rolls? At the end?

  return rollModifiersData;
}

export function getRollSummary(rollSummaryData) {
  const rollSummaryContent = Mustache.render(summaryTemplate, {
    results: rollSummaryData,
  });
  return `<div class='fh-roll-summary'>${rollSummaryContent}</div>`;
}

export class FHRollSystem {
  static subscribeToRenderChatLog(html) {
    html.on('click', '.fh-roller-reroll', this.diceRollerButtonHandler);
  }

  static diceRollerChatMessageHandler(_chatLog, messageText, data) {
    if (messageText !== undefined) {
      if (game.farhome.roller.handlesCommand(messageText)) {
        data.content = game.farhome.roller.rollCommand(messageText);
        ChatMessage.create(data, {});
        return false;
      }
    }
    return true;
  }

  static diceRollerButtonHandler(event) {
    event.preventDefault();

    const button = event.target;
    const form = button.parentElement;
    const rolls = Array.from(form.querySelectorAll('input'));
    const selectedRolls = rolls.filter((roll) => roll.checked);

    if (selectedRolls.length > 0) {
      const parsedRolls = rolls.map((rollInput) => {
        const roll = parseRoll(rollInput);
        return new ReRoll(roll, rollInput.checked);
      });
      const result = game.farhome.roller.formatReRolls(parsedRolls);
      renderNewRoll(result);

      selectedRolls.forEach((elem) => (elem.checked = false));

      // #todo Need to add support to disable roll checkboxes and display the re-rolls here too... Create some helper functions here that can be re-used elsewhere.
    }
  }
}
