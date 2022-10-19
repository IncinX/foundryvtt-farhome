// #todo This should be moved into a utility folder since there are cross dependencies between the core and roller which is not ideal.

/**
 * Search up the parent chain to find the node classed as message-content.
 * @param {HTMLElement} htmlElement The HTMLElement to start searching from.
 * @returns {HTMLElement} The element classed as message-content.
 */
export function findMessageContentNode(htmlElement) {
  let currentNode = htmlElement;
  while (currentNode.parentNode && !currentNode.classList.contains('message-content')) {
    currentNode = currentNode.parentNode;
  }
  return currentNode;
}

/**
 * Constructs and sends a standard message to the shared chat log.
 * @param {String} content Constructs a foundry ChatMessage object with the given content.
 * @returns ChatMessage The constructed ChatMessage object.
 */
export function sendStandardMessage(content) {
  // Roll mode controls what chat it goes to
  const rollMode = game.settings.get('core', 'rollMode');

  // Construct the chat message and send it
  let chatData = {
    user: game.user._id,
    content: content,
  };

  ChatMessage.applyRollMode(chatData, rollMode);
  return ChatMessage.create(chatData);
}

/**
 * Constructs and sends a standard message to the shared chat log.
 * @param {String} content Constructs a foundry ChatMessage object with the given content.
 * @returns ChatMessage The constructed ChatMessage object.
 */
export function sendActorMessage(content) {
  // #todo What is the difference with this method? This should maybe accept an actor as a parameter.
  return sendStandardMessage(content);
}
