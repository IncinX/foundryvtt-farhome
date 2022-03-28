import { farhome } from './config';
import { registerSettings } from './settings';
import { preloadTemplates } from './preloadTemplates';
import FarhomeItemSheet from './sheets/item-sheet';

// Initialize system
Hooks.once('init', async () => {
  console.log('farhome | Initializing farhome');

  // Assign custom classes and constants here
  CONFIG.farhome = farhome;

  // Register custom system settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('farhome', FarhomeItemSheet, { makeDefault: true });
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
