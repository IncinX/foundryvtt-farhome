// #todo Rename this to something better
// #todo Add function/class documentation for all the code in farhome
// #todo Clean up all the code

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

export function diceRollerChatMessageHandler(_chatLog, messageText, data) {
  if (messageText !== undefined) {
    if (game.farhome.roller.handlesCommand(messageText)) {
      data.content = game.farhome.roller.rollCommand(messageText);
      ChatMessage.create(data, {});
      return false;
    }
  }
  return true;
}

export function diceRollerButtonHandler(event) {
  event.preventDefault();

  const button = event.target;
  const rollerKey = button.dataset.roller;
  const form = button.parentElement;
  const rolls = Array.from(form.querySelectorAll('input'));
  const selectedRolls = rolls.filter((roll) => roll.checked);

  for (const roller of rollers) {
    if (selectedRolls.length > 0 && roller.command === rollerKey) {
      if (button.classList.contains('fh-roller-keep') && roller.canKeep) {
        const keptRolls = selectedRolls.map((roll) => parseRoll(roll));
        const result = roller.formatKeptRolls(keptRolls);
        renderNewRoll(result);
      } else if (roller.canReRoll) {
        const parsedRolls = rolls.map((rollInput) => {
          const roll = parseRoll(rollInput);
          return new ReRoll(roll, rollInput.checked);
        });
        const result = roller.formatReRolls(parsedRolls);
        renderNewRoll(result);
      }

      selectedRolls.forEach((elem) => (elem.checked = false));
    }
  }
}
