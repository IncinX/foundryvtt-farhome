import { FARHOME } from './helpers/config';
import { createItemMacro, rollItemMacro } from './helpers/macros';
import { ChatRoller } from './helpers/chat-roller';
import { registerSettings } from './settings';
import { preloadTemplates } from './preload-templates';
import { FarhomeActor } from './documents/actor';
import { FarhomeItem } from './documents/item';
import { _getInitiativeFormula } from './helpers/initiative';
import { secureRandomNumber } from './roller/rng';
import { FHRoller } from './roller/fh/roller';
import { FHRollSystem } from './roller/system';
import { createCompendiumFromRules } from './importers/farhome-rules';
import { createCompendiumFrom5etoolsBeastiary } from './importers/5etools-monsters';
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
    createCompendiumFromRules,
    createCompendiumFrom5etoolsBeastiary,
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
  Hooks.on('chatMessage', FHRollSystem.diceRollerChatMessageHandler);

  // Register font here
  $('head').append('<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Fondamento">');
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
  // #todo ChatRoller should probably be renamed to TemplateRoller
  FarhomeItem.subscribeToRenderChatLog(html);
  ChatRoller.subscribeToRenderChatLog(html);
  FHRollSystem.subscribeToRenderChatLog(html);
});
