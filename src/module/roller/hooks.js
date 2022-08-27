// #todo Rename this to something better
// #todo Add function/class documentation for all the code in farhome
// #todo Clean up all the code
import { ReRoll } from './roller';

export function parseRoll(input) {
  const die = parseInt(input.dataset.die ?? '0', 10);
  const face = parseInt(input.dataset.face ?? '0', 10);
  return [die, face];
}

function renderNewRoll(rolls) {
  const chatData = {
    user: game.user.id,
    content: rolls,
  };
  ChatMessage.create(chatData, { displaySheet: false });
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

      // #todo Need to add support to disable rool checkboxes and display the re-rolls here too... Create some helper functions here that can be re-used elsewhere.
    }
  } 
}