import { sendActorMessage } from './chat';
import { getRollSummaryData, getRollSummary } from '../roller/system';

export class ChatRoller {
  static chatRerollClass = 'fh-reroll';

  /**
   * Get the button for the chat re-roll button.
   * @returns {string}  The html string to render the re-roll button.
   * @private
   */
  static getButtonHtml() {
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
  static subscribeToChatLog(html) {
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

    // #todo Try to avoid code duplication with roller's diceRollerButtonHandler() function

    // #todo Construct a new message based on the existing message (but with the rolls replaced).

    // #todo Base this functionality off of what is available in the fh-roller

    // #todo Construct the new message with the old images greyed out (likely through a CSS class) and no images should be allowed for another re-roll.
    //      Disabling the input to prevent more re-roll selection can be done by adding a disabled attribute on the input control.

    const button = event.target;
    const message = button.parentElement.parentElement;
    const rolls = Array.from(message.querySelectorAll('input'));
    const selectedRolls = rolls.filter((roll) => roll.checked);

    // DEBUG message
    console.log('Selected rolls:', selectedRolls);

    sendActorMessage(message.innerHTML);

    // #todo Old rolls should be disabled to get the desired effect in css and for parsing.

    // #todo DEBUG AND GET THIS WORKING NEXT!
    const parsedRolls = rolls.map((rollInput) => {
      const roll = parseRoll(rollInput);
      return new ReRoll(roll, rollInput.checked);
    });

    const result = game.farhome.roller.formatReRolls(parsedRolls);
    renderNewRoll(result);
    selectedRolls.forEach((elem) => (elem.checked = false));

    // #todo Need to replace the summary text (successes, wounds, etc) and maybe add some stuff for hex/poison later
  }
}
