import { sendActorMessage } from './chat';
import { getRollSummaryData, getRollSummary, parseRoll } from '../roller/roller';

// #todo Have connection and private callbacks similar to roller.js, that should simplify things since some things can be a classless module.
// #todo Also consider moving a lot of this logic into roller.js or roller-chat.js or something.

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
  static subscribeToRenderChatLog(html) {
    html.on('click', `.${this.chatRerollClass}`, this._handleReroll.bind(this));
  }

  /**
   * Handle click message generated from the "Re-roll" button in chat.
   * @param {Event} event   The originating click event
   * @private
   */
  static async _handleReroll(event) {
    event.preventDefault();

    // #todo It may be insufficient to just use button.parentElement.parentElement... I think I need to traverse up the DOM tree until I find the main content element

    const button = event.target;
    const originalMessageElement = button.parentElement.parentElement;
    const messageElementClone = originalMessageElement.cloneNode(true);
    const messageQuery = $(messageElementClone);
    const rollElements = messageQuery.find('input');

    // Iterate through the inputs to find the dice to re-roll.
    let pendingReRollElements = [];

    rollElements.each((_index, element) => {
      if (element.checked) {
        element.disabled = true;
        pendingReRollElements.push(element);
      }
    });

    // Do the re-roll after the parsing so it doesn't interfere with the parsing.
    pendingReRollElements.forEach((pendingReRollElement) => {
      const rollData = parseRoll(pendingReRollElement);
      const newRoll = game.farhome.roller.reRoll([], [rollData])[0];
      const rollHtml = game.farhome.roller.formatRoll(newRoll);
      pendingReRollElement.insertAdjacentHTML('afterend', rollHtml);
    });

    // Need to re-compute the summary and re-post under the fh-roll-summary class
    const newRollSummaryData = getRollSummaryData(messageQuery);
    const newRollSummary = getRollSummary(newRollSummaryData);
    let rollSummaryElement = $(messageQuery).find('.fh-roll-summary');
    rollSummaryElement.empty();
    rollSummaryElement.append(newRollSummary);

    // #todo This will definitely need to be integrated with the main rolling system so only one function with the up-to-date functionality
    //       for both templated and non-templated rolls.

    sendActorMessage(messageQuery.html());
  }
}
