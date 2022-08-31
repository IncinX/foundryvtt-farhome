# foundryvtt-farhome P0 todo

- [ ] Spend some time considering a newer and better font
- [ ] Add blurred farhome background
- [ ] Tryout Farhome font, install a couple fonts and play with them later (and delete the unused ones later)
- [ ] Widen column 2 so that it grows to content or is a bit bigger than the others
- [x] Streamline the skills (add str/dex/con/etc to the skills and spells)
- [ ] Cleanup the css code and segment into separate files
- [ ] Cleanup table headers for Feats/Maneuvers/Spells/Inventory
- [ ] Cleanup the tabbed interface and background color
- [ ] Add nice background image to the character sheet based on Andrew's art
- [ ] Convert the skill roller to use a unified roll function that can support the new template roll features(use Mustache for now maybe).
- [ ] Adjust padding/borders in the proficiency boxes and around the tables
- [ ] Adjust the font size across the board but especially the character name, etc.
- [ ] Adjust alignment on text appropriately.
- [ ] Setup background of the selected tab and tabbed content to match
  - [ ] Setup the bottom of the tab to hide the border like bootstrap does
- [ ] Add separate box for Temporary Wounds
- [ ] Rename Healing Surges to Surges
- [ ] Tweak coloring of messages to match the character sheets
- [ ] Tweak size of icon on character sheets (but not on actor sheet)
- [ ] Add support for poison/hex effects (and apply it to proficiency and template rolls)
- [ ] Add support for new user query syntax {{}} in templates or allow a user input tab to items that allow for a customized query syntax, applying to a variable, response type, etc.
  - [ ] This is to support things that need a user response beyond just spell level
- [ ] Make sure that Overswing is supported
- [ ] Move todo list out to GitHub issues

# foundryvtt-farhome P1 todo

- [ ] Add indicators in the summary for how much was added by bonus modifiers)
- [ ] Cleanup integrated roller code (flatten and rename)
- [ ] Create clean infrastructure for creating new roll templates, re-rolling from templates, re-posting rolls from re-rolled templates. Document it in code.
- [ ] Make system context obsolete. Add all current system functions to the local context.
- [ ] Create macro to search/replace all character item templates to make deprecation of template stuff easier.
- [ ] Change Mustache renderer to handlebars renderer
- [ ] Upgrade FoundryVTT to the latest version (and verify that my system keeps working) - Do this on test server first after the new updates are out.

# foundryvtt-farhome P2 todo

- [ ] Add support for private members according to this (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- [ ] Automated tests for template evaluator
- [ ] Start churning through #todo's to clean things up
- [ ] Add jsdoc comments to get all the documentation up to par
- [ ] Add a derp-speak language to test out localization (and allow the players to choose it)

# Games todo

- [ ] Finish Sekiro