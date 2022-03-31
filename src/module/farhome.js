import { FARHOME } from './config';
import { registerSettings } from './settings';
import { preloadTemplates } from './preloadTemplates';
import { FarhomeActor } from './documents/actor';
import { FarhomeItem } from './documents/item';
import FarhomeItemSheet from './sheets/item-sheet';
import FarhomeCharacterSheet from './sheets/character-sheet';

// Initialize system
Hooks.once('init', async () => {
  console.log('farhome | Initializing farhome');

  // Assign custom classes and constants here
  CONFIG.FARHOME = FARHOME;

  // TODO Need to create an initiative formula for the system

  // Register custom system settings
  registerSettings();

  // Register custom Document classes
  CONFIG.Actor.documentClass = FarhomeActor;
  CONFIG.Item.documentClass = FarhomeItem;

  // Register custom sheets (if any)
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('farhome', FarhomeItemSheet, { makeDefault: true });

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('farhome', FarhomeCharacterSheet, { makeDefault: true });

  // Preload Handlebars templates
  await preloadTemplates();
});

// Setup system
Hooks.once('setup', async () => {
  // Do anything after initialization but before
  // ready
});

// When ready
Hooks.once('ready', async () => {
  // Do anything once the system is ready
});

// Add any additional hooks if necessary
