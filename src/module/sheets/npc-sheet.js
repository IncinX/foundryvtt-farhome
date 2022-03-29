import FarhomeActorSheet from './actor-sheet';

export default class FarhomeNpcSheet extends FarhomeActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 560,
      height: 400,
      classes: ['farhome', 'sheet', 'actor', 'npc'],
    });
  }
}
