export function sendStandardMessage(speaker, content) {
  // Roll mode controls what chat it goes to
  const rollMode = game.settings.get('core', 'rollMode');

  // Construct the chat message and send it
  let chatData = {
    user: game.user._id,
    speaker: speaker,
    content: content,
  };

  ChatMessage.applyRollMode(chatData, rollMode);
  return ChatMessage.create(chatData);
}

export function sendActorMessage(actor, content) {
  const speaker = ChatMessage.getSpeaker({ actor: actor });
  return sendStandardMessage(speaker, content);
}
