import { FARHOME } from './helpers/config';
import { createItemMacro, rollItemMacro } from './helpers/macros';
import { registerSettings } from './settings';
import { preloadTemplates } from './preload-templates';
import { FarhomeActor } from './documents/actor';
import { FarhomeItem } from './documents/item';
import { _getInitiativeFormula } from './helpers/initiative';
import FarhomeItemSheet from './sheets/item-sheet';
import FarhomeActorSheet from './sheets/actor-sheet';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Initialize system
Hooks.once('init', async () => {
  console.log('farhome | Initializing farhome');

  game.farhome = {
    FarhomeActor,
    FarhomeItem,
    rollItemMacro,
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
/*  Ready/System Hooks                          */
/* -------------------------------------------- */

// Setup system
Hooks.once('setup', async () => {
  // Do anything after initialization but before
  // ready
});

Hooks.once('ready', async () => {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

// Monitoring button pushes in chat messages
Hooks.on('renderChatLog', () => {
  $('#chat-log').on('click', '.spend-mana button', (event) => {
    /*
    event.preventDefault();

    const button = event.target;
    const rollerKey = button.dataset.roller;
    const form = button.parentElement;

    console.log('button-click');
    */
  });
});
