import FarhomeActorSheet from './actor-sheet';

export default class FarhomeCharacterSheet extends FarhomeActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 800,
      height: 600,
      classes: ['farhome', 'sheet', 'actor', 'character'],
    });
  }
}
