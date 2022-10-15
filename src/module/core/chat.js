// #todo This should be moved into a utility folder since there are cross dependencies between the core and roller which is not ideal.

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

export function sendActorMessage(content) {
  return sendStandardMessage(content);
}
