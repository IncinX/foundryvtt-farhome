/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your system, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your system.
 */

// Import TypeScript modules
import { farhome } from "./config";
import { registerSettings } from './settings';
import { preloadTemplates } from './preloadTemplates';
import FarhomeItemSheet from './sheets/item-sheet';

// Initialize system
Hooks.once('init', async () => {
  console.log('farhome | Initializing farhome');

  // Assign custom classes and constants here
  // #todo Find out if this is how other modules do it and update if necessary.  (Ideally find a good Typescript based project to base it off of)
  // @ts-ignore TS2339: Not sure how to extend this using Typescript.
  CONFIG.farhome = farhome;

  // Register custom system settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("farhome", FarhomeItemSheet, { makeDefault: true });
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
