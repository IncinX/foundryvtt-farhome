import { registerSettings } from './settings';
import { preloadTemplates } from './preload-templates';

import { FARHOME } from './core/config';
import { populateStatusEffectsFromCompendium } from './core/effects';
import { createItemMacro, rollItemMacro } from './core/macros';
import { getInitiativeFormula } from './core/initiative';

import { FarhomeActor } from './documents/actor';
import { FarhomeItem } from './documents/item';
import { FarhomeItemSheet, connectItemHooks } from './sheets/item-sheet';
import { FarhomeActorSheet, connectActorHooks } from './sheets/actor-sheet';

import { createCompendiumFromRules } from './importers/farhome-rules-importer';
import {
  createCompendiumFromVetoolsBeastiary,
  VetoolsMonsterImportConfig,
} from './importers/vetools-monsters-importer';
import { connectRulesImporterApp as connectRulesImporterAppHooks } from './apps/farhome-rules-importer-app';
import { connectVetoolsMonsterImporterApp as connectVetoolsMonsterImporterAppHooks } from './apps/vetools-monsters-importer-app';

import { secureRandomNumber } from './roller/roller-util';
import { FHRoller, sendChatLabelFormula, connectRoller as connectRollerHooks } from './roller/roller';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Initialize system
Hooks.once('init', async () => {
  console.log('Farhome | Initializing farhome');

  const roller = new FHRoller(secureRandomNumber);

  game.farhome = {
    // Centralized roller for global use
    roller,

    // Easy-to-use method for sending labelled rolls to chat
    sendChatLabelFormula,

    // Actor and Item Documents for global use
    FarhomeActor,
    FarhomeItem,

    // Item roller macro helper for macro use
    rollItemMacro,

    // Importer methods for macro use
    createCompendiumFromRules,
    createCompendiumFromVetoolsBeastiary,
    VetoolsMonsterImportConfig,
  };

  // Assign custom classes and constants here
  CONFIG.FARHOME = FARHOME;

  // Configure the initiative formula
  CONFIG.Combat.initiative.formula = '';
  Combatant.prototype._getInitiativeFormula = getInitiativeFormula;

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
  // #todo Move these to connect functions similar to below.
  Hooks.on('hotbarDrop', (_bar, data, slot) => {
    createItemMacro(data, slot);

    // Must return false to prevent default behavior.
    return false;
  });

  // Iterate through the conditions pack to populate the conditions
  // The compendiums will be loaded in ready and it is before the user has a chance to click on the token
  // to show the status effect icons. This is the best opportunity to change the status effects for the system.
  populateStatusEffectsFromCompendium('farhome.farhome-conditions');
});

/* -------------------------------------------- */
/*  Connect Hooks to sub-systems                */
/* -------------------------------------------- */
connectRollerHooks();
connectActorHooks();
connectItemHooks();
connectRulesImporterAppHooks();
connectVetoolsMonsterImporterAppHooks();
