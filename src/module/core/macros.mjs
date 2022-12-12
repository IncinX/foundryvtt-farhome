/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createItemMacro(data, slot) {
  if (data.type !== 'Item') return;

  const item = await Item.implementation.fromDropData(data);

  if (!item) return ui.notifications.warn('You can only create macro buttons for owned Items');

  // #todo Should probably change the reference from name to id if possible.

  // Create the macro command
  const command = `game.farhome.rollItemMacro('${item.name}');`;
  let macro = game.macros.find((m) => m.name === item.name && m.command === command);
  if (!macro) {
    macro = await Macro.create({
      type: 'script',
      scope: 'actor',
      name: item.name,
      img: item.img,
      command: command,
      flags: { 'farhome.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
export function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find((i) => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // #todo Possibly pass in actor here as a parameter or modify the roll function to also query the owning actor (ideally based on _id)

  // Trigger the item roll
  return item.roll();
}
