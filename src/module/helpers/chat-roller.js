import { sendActorMessage } from './chat';

export class ChatRoller {
  static chatRerollClass = 'farhome-reroll';

  /**
   * Get the button for the chat re-roll button.
   * @returns {string}  The html string to render the re-roll button.
   * @private
   */
  static _getButtonHtml() {
    return `
      <form>
        <button class="${this.chatRerollClass}">
          ${game.i18n.localize('farhome.reroll')}
        </button>
      </form>`;
  }

  /**
   * Opportunity to subscribe to chat log events.
   * @param {Document} html   The html document for the chat log.
   * @private
   */
  static _subscribeToChatLog(html) {
    html.on('click', `.${this.chatRerollClass}`, this._handleReroll.bind(this));
  }

  /**
   * Handle click message generated from the "Re-roll" button in chat.
   * @param {Event} event   The originating click event
   * @private
   */
  static async _handleReroll(event) {
    event.preventDefault();

    // Disable the button
    event.currentTarget.disabled = true;

    console.log('Re-roll requested');

    // TODO Construct a new message based on the existing message (but with the rolls replaced).

    // TODO Base this functionality off of what is available in the special-dice-roller

    // TODO Construct the new message with the old images greyed out (likely through a CSS class) and no images should be allowed for another re-roll.
    //      Disabling the input to prevent more re-roll selection can be done by adding a disabled attribute on the input control.

    const button = event.target;
    const message = button.parentElement.parentElement;
    const rolls = Array.from(message.querySelectorAll('input'));
    const selectedRolls = rolls.filter((roll) => roll.checked);

    console.log('Selected rolls:', selectedRolls);

    sendActorMessage(message.innerHTML);

    /*
    for (const roller of rollers) {
      const parsedRolls = rolls
        .map((rollInput) => {
          const roll = parseRoll(rollInput);
          return new ReRoll(roll, rollInput.checked);
        });

      const result = roller.formatReRolls(parsedRolls);
      renderNewRoll(result);
      selectedRolls.forEach((elem) => elem.checked = false);
    }
    */
  }
}
