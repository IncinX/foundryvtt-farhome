import { localizeObject } from '../helpers/localization';
import { evaluateTemplate } from '../helpers/template-evaluator';

export default class FarhomeItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['farhome', 'sheet', 'item'],
      width: 560,
      height: 400,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }],
    });
  }

  /** @override */
  get template() {
    return `systems/farhome/templates/sheets/${this.item.data.type}-sheet.hbs`;
  }

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const itemData = this.item.data.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = itemData.data;
    context.flags = itemData.flags;

    this._prepareAllItemData(context);

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    return context;
  }

  /**
   * Prepare the item derived sheet-specific data (common to all items
   *
   * @param {Object} itemData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareAllItemData(itemData) {
    // Do derived localization of the entire context data.
    localizeObject(null, itemData.data);
  }

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find('.sheet-body');
    const bodyHeight = position.height - 192;
    sheetBody.css('height', bodyHeight);
    return position;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.

    // TODO This should call the roll handler on the item itself.
    html.find('.item-roll').click((ev) => {
      console.log('Clicked Item Roll!');
      // TODO Remove this debug code later.  It should go in the item roll function.
      let sampleData = {
        attributes: {
          dex: {
            value: 3,
          },
        },
        proficiencies: {
          dex: {
            acrobatics: {
              value: 2,
            },
          },
        },
      };

      console.log(evaluateTemplate('[${dex}]', sampleData));
    });
  }
}
