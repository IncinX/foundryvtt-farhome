import { sendActorMessage } from './chat';
import { getRollSummaryData, getRollSummary } from '../roller/system';
import { parseRoll } from '../roller/system';

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
    //       Try to do this by creating common functionality and tags between the legacy roll system and the new one.

    const button = event.target;
    const messageQuery = $(button.parentElement.parentElement);
    const rollElements = messageQuery.find('input');

    // Iterate through the inputs to find the dice to re-roll.
    let pendingReRollElements = [];

    rollElements.each((index, element) => {
      if (element.checked) {
        element.disabled = true;
        pendingReRollElements.push(rollData);
      }
    });

    // Do the re-roll after the parsing so it doesn't interfere with the parsing.
    pendingReRollElements.forEach((pendingReRollElement) => {
      const rollData = parseRoll(element);

      // #todo Re-roll the die and add the new roll after the current element
      //       Pay close attention to how the roll template does this with Mustache.
    });

    // #todo Need to re-compute the summary (from fh-roll class) and re-post under (fh-roll-summary class)

    // #todo This will definitely need to be integrated with the main rolling system so only one function with the up-to-date functionality
    //       for both templated and non-templated rolls.

    sendActorMessage(messageQuery.html());
  }
}
