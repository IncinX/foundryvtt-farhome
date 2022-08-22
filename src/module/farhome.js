import { FARHOME } from './helpers/config';
import { createItemMacro, rollItemMacro } from './helpers/macros';
import { registerSettings } from './settings';
import { preloadTemplates } from './preload-templates';
import { FarhomeActor } from './documents/actor';
import { FarhomeItem } from './documents/item';
import { _getInitiativeFormula } from './helpers/initiative';
import { secureRandomNumber } from './roller/rng';
import { FHRoller } from './roller/fh/roller';
import { diceRollerChatMessageHandler, diceRollerButtonHandler } from './roller/index';
import FarhomeItemSheet from './sheets/item-sheet';
import FarhomeActorSheet from './sheets/actor-sheet';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Initialize system
Hooks.once('init', async () => {
  console.log('farhome | Initializing farhome');

  const roller = new FHRoller(secureRandomNumber, 'fh');

  game.farhome = {
    FarhomeActor,
    FarhomeItem,
    rollItemMacro,
    roller,
  };

  // Assign custom classes and constants here
  CONFIG.FARHOME = FARHOME;

  // Configure the initiative formula
  CONFIG.Combat.initiative.formula = '';
  Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;

  // Register custom system settings
  registerSettings();

  // Register custom Document classes
  CONFIG.Actor.documentClass = FarhomeActor;
  CONFIG.Item.documentClass = FarhomeItem;

  // Register custom sheets (if any)
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('farhome', FarhomeItemSheet, { makeDefault: true });

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('farhome', FarhomeActorSheet, { makeDefault: true });

  // Preload Handlebars templates
  await preloadTemplates();
});

Hooks.on('init', () => {
  // Register chat handler
  // #todo Clean this up a bit later (moving to separate files that specifically handle the roll logic)
  Hooks.on('chatMessage', diceRollerChatMessageHandler);
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function () {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Setup Hook                                  */
/* -------------------------------------------- */

// Setup system
Hooks.once('setup', async () => {
  // Do anything after initialization but before ready
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', async () => {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (_bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Render Chat Log Hook                        */
/* -------------------------------------------- */

Hooks.on('renderChatLog', (_app, html, _data) => {
  FarhomeItem._subscribeToChatLog(html);

  // Register the chat log rice roller button handler
  // #todo Clean this up a bit later (moving to separate files that specifically handle the roll logic)
  // #todo Should _subscribeToChatLog above also use the JQuery $ first?
  $('#chatlog').on('click', '.special-dice-roller button', diceRollerButtonHandler);
});
