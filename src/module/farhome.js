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
import { createCompendiumFromRules } from './importers/farhome-rules-importer';
import {
  createCompendiumFromVetoolsBeastiary,
  VetoolsMonsterImportConfig,
} from './importers/vetools-monsters-importer';
import { connectRulesImporterApp } from './apps/farhome-rules-importer-app';
import { connectVetoolsMonsterImporterApp } from './apps/vetools-monsters-importer-app';
import FarhomeItemSheet from './sheets/item-sheet';
import FarhomeActorSheet from './sheets/actor-sheet';
import { populateStatusEffectsFromCompendium } from './core/effects';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Initialize system
Hooks.once('init', async () => {
  console.log('farhome | Initializing farhome');

  const roller = new FHRoller(secureRandomNumber, 'fh');

  game.farhome = {
    // Centralized roller for global use
    roller,

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
  Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;

  // #debug Mess around with the effects... move this into a function with a nice comment when it is working
  //        These status effects automatically translate to activeEffects when added to character tokens... and then is an easy way to get hex and poison working for now
  const effectData = {
    id: 'testEffect',
    label: 'farhome.extraDice',
    icon: 'icons/svg/holy-shield.svg',
  };

  CONFIG.statusEffects = [];
  CONFIG.statusEffects.push(effectData);

  // #debug Too early to do this, need to hook later
  //game.scene.hud.token.refreshStatusIcons();

  // #todo How to trigger an update to the status effects that show on tokens? Look at that github project that adds counters to effects

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

  // Iterate through the conditions pack to populate the conditions
  // The compendiums will be loaded in ready and it is before the user has a chance to click on the token
  // to show the status effect icons. This is the best opportunity to change the status effects for the system.
  populateStatusEffectsFromCompendium('farhome.farhome-conditions');
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

/* -------------------------------------------- */
/*  Connect Sub-Applications                    */
/* -------------------------------------------- */

connectRulesImporterApp();
connectVetoolsMonsterImporterApp();
