# foundryvtt-farhome todo

## P0

- [ ] For the roll summary (add text saying +1 from template or something)
- [ ] Convert the skill roller to use a unified roll function that can support the new template roll features(use Mustache for now maybe).
- [ ] Tweak coloring of messages to match the character sheets
- [ ] Tweak size of icon on character sheets (but not on actor sheet)
- [ ] Add support for poison/hex effects (and apply it to proficiency and template rolls)
- [ ] Add support for new user query syntax {{}} in templates or allow a user input tab to items that allow for a customized query syntax, applying to a variable, response type, etc.
  - [ ] This is to support things that need a user response beyond just spell level
- [ ] Make sure that Overswing is supported
- [ ] Move todo list out to GitHub issues
- [ ] Let the farhome players know that I can setup developer accounts for them that will run on a different port and allow open development

## P1

- [ ] Try removing the bold from the text labels everywhere
- [ ] Consider applying a blur and darkening effect to the farhome background
- [ ] Add indicators in the summary for how much was added by bonus modifiers)
- [ ] Cleanup integrated roller code (flatten and rename)
- [ ] Create clean infrastructure for creating new roll templates, re-rolling from templates, re-posting rolls from re-rolled templates. Document it in code.
- [ ] Make system context obsolete. Add all current system functions to the local context.
- [ ] Create macro to search/replace all character item templates to make deprecation of template stuff easier.
- [ ] Change Mustache renderer to handlebars renderer
- [ ] Upgrade FoundryVTT to the latest version (and verify that my system keeps working) - Do this on test server first after the new updates are out.

## P2

- [ ] Add support for private members according to this (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- [ ] Automated tests for template evaluator
- [ ] Start churning through #todo's to clean things up
- [ ] Add jsdoc comments to get all the documentation up to par
- [ ] Add a derp-speak language to test out localization (and allow the players to choose it)

# Useful links and tools

- Codepen.io for quick prototyping(https://codepen.io/pen/)
- Bootstrap for solid production-grade css styles
- Complete guide to flexbox (with exampels) - https://css-tricks.com/snippets/css/a-guide-to-flexbox/