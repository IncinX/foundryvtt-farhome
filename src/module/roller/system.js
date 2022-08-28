// #todo Rename this to something better
// #todo Add function/class documentation for all the code in farhome
// #todo Clean up all the code
// #todo Cleanup the import dependencies, avoid ciruclar dependencies
import { ReRoll } from './roller';

export function parseRoll(input) {
  const die = parseInt(input.dataset.die ?? '0', 10);
  const face = parseInt(input.dataset.face ?? '0', 10);
  return { die, face };
}

function renderNewRoll(rolls) {
  const chatData = {
    user: game.user.id,
    content: rolls,
  };
  ChatMessage.create(chatData, { displaySheet: false });
}

export function getRollSummaryData(rollHtml) {
  // BEGIN DEBUG! (Roll parsing)
  console.log(rollHtml);

  let fhRoll = $(rollHtml);

  fhRoll.find('input').each((_index, element) => {
    if (!element.disabled) {
      const rollData = parseRoll(element);
    }
  });

  // Compute the roll modifiers
  let rollModifiers = {
    success: 0,
    crit: 0,
    hex: 0,
    poison: 0,
  };

  fhRoll.find('.fh-success').each((_index, element) => {
    rollModifiers.success += parseInt(element.dataset.success);
  });
  fhRoll.find('.fh-crit').each((_index, element) => {
    rollModifiers.crit += parseInt(element.dataset.crit);
  });
  fhRoll.find('.fh-hex').each((_index, element) => {
    rollModifiers.hex += parseInt(element.dataset.hex);
  });
  fhRoll.find('.fh-poison').each((_index, element) => {
    rollModifiers.poison += parseInt(element.dataset.poison);
  });

  console.log(rollModifiers);

  // #todo Apply the roll modifiers to the rollValuesMonoid

  // #todo Need to end up with rollValuesMonoid and then pipe that into a Mustache render of tpl
  // END DEBUG
}

export function getRollSummaryContent(rollSummaryData) {
  // #todo Fill out the roll summary area. (rendered through Mustache for now)
  console.log(rollSummaryData);
  return ``;
}

export class FHRollSystem {
  static subscribeToChatLog(html) {
    html.on('click', '.fh-roller-reroll', this.diceRollerButtonHandler);
    /*
    html.on('click', '.fh-roller-reroll', (event) => {
      console.log("hello");
      event.preventDefault();
    });
    */
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
