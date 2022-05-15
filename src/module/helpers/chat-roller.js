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

    // TODO base this functionality off of what is available in the special-dice-roller

    // TODO construct the new message with the old images greyed out (likely through a CSS class) and no images should be allowed for another re-roll.

    /*
    const button = event.target as HTMLButtonElement;
    const rollerKey = button.dataset.roller;
    const form = button.parentElement as HTMLFormElement;
    const rolls = Array.from(form.querySelectorAll('input'));
    const selectedRolls = rolls.filter((roll) => roll.checked);

    for (const roller of rollers) {
      if (selectedRolls.length > 0 && roller.command === rollerKey) {
        const parsedRolls = rolls
          .map((rollInput) => {
            const roll = parseRoll(rollInput);
            return new ReRoll(roll, rollInput.checked);
          });

        const result = roller.formatReRolls(parsedRolls);
        renderNewRoll(result);
        selectedRolls.forEach((elem) => elem.checked = false);
      }
    }
    */
  }
}
