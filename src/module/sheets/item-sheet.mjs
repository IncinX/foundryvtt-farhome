import { localizeObject } from '../core/localization';
import { sendActorMessage } from '../core/chat';

export class FarhomeItemSheet extends ItemSheet {
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
    return `systems/farhome/templates/sheets/item/${this.item.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = await super.getData();

    // Add the farhome configuration so it is available in handlebars.
    context.config = CONFIG.FARHOME;

    // Use a safe clone of the actor data for further operations.
    const itemData = this.item.toObject(false);

    // Add the actor's data to context.system for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    this._prepareAllItemData(context);

    // Retrieve the roll data for TinyMCE editors.
    // #todo I don't think this is needed anymore.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Run the TextEditor.enrichHTML on editor text entries
    context.enrichedText = {
      description: await this._enrichTextHTML(context.system.description),
      rollTemplate: await this._enrichTextHTML(context.system.rollTemplate),
      note: await this._enrichTextHTML(context.system.note),
    };

    return context;
  }

  /**
   * Enriches the text HTML for a given field if it exists, otherwise it returns empty.
   * @param {string} field The field to enrich.
   * @return {string} The enriched HTML.
   */
  async _enrichTextHTML(field) {
    return field !== undefined ? await TextEditor.enrichHTML(field.value, { async: true }) : '';
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
    localizeObject(null, itemData.system);
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

    // Roll Handler
    html.find('.item-roll').click((ev) => this.item.roll());
  }
}

/**
 * Connect the item hooks to the foundry hook system.
 */
export function connectItemHooks() {
  Hooks.on('renderChatLog', (_app, html, _data) => {
    html.on('click', '.fh-spend-mana', _handleManaSpend);
    html.on('click', '.fh-spend-ap', _handleAPSpend);
  });
}

/**
 * Handle click message generated from the "Spend Mana" button in chat.
 * @param {Event} event   The originating click event
 * @private
 */
async function _handleManaSpend(event) {
  event.preventDefault();

  // Disable the button
  event.currentTarget.disabled = true;

  // Get the data from the button
  let manaCost = parseInt(event.currentTarget.dataset.mana);
  let actorId = event.currentTarget.dataset.actorId;

  // Check for ownership
  let actor = game.actors.get(actorId);
  if (!actor.isOwner) {
    sendActorMessage(
      'You do not own this actor, so stop trying to spend their mana. ' +
        'They are <i>probably</i> competant enough to do that themselves.',
    );
    return;
  }

  // Deduct the mana off of the character's sheet
  actor.update({ 'system.features.mana.value': actor.system.features.mana.value - manaCost });

  // Send the confirmation message to the chat
  // #todo This should be a localized string.
  sendActorMessage(`<b>${actor.name}</b> spent ${manaCost} mana.`);
}

/**
 * Handle click message generated from the "Spend AP" button in chat.
 * @param {Event} event   The originating click event
 * @private
 */
async function _handleAPSpend(event) {
  event.preventDefault();

  // Disable the button
  event.currentTarget.disabled = true;

  // Get the data from the button
  let apCost = parseInt(event.currentTarget.dataset.ap);
  let actorId = event.currentTarget.dataset.actorId;

  // Check for ownership
  let actor = game.actors.get(actorId);
  if (!actor.isOwner) {
    sendActorMessage(
      'You do not own this actor, so stop trying to spend their AP. ' +
        'They are <i>probably</i> competant enough to do that themselves.',
    );
    return;
  }

  // Deduct the mana off of the character's sheet
  actor.update({ 'system.features.ap.value': actor.system.features.ap.value - apCost });

  // Send the confirmation message to the chat
  // #todo This should be a localized string.
  sendActorMessage(`<b>${actor.name}</b> spent ${apCost} ap.`);
}
