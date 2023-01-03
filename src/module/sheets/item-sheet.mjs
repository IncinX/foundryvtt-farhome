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

    // Prompts
    html.find('.item-add-prompt').click(this._onItemAddPrompt.bind(this));
    html.find('.item-remove-prompt').click(this._onItemRemovePrompt.bind(this));
    html.find('.item-prompt-title-input').change(this._onItemPromptTitleChange.bind(this));
    html.find('.item-prompt-description-input').change(this._onItemPromptDescriptionChange.bind(this));
    html.find('.item-prompt-choice-name-input').change(this._onItemPromptChoiceNameChange.bind(this));
    html.find('.item-prompt-choice-value-input').change(this._onItemPromptChoiceValueChange.bind(this));
  }

  /**
   * Handle adding a new prompt to an item.
   * @param {Event} _event The originating click event
   * @private
   */
  async _onItemAddPrompt(_event) {
    // #todo Add the ability to add choices
    // #todo Fix localization errors from within prompts (likely requires change to the localizeObject) function.

    // #note Due to the nature of the templates with an embedded array. It was decided to update the entire array when changes are made.
    // #note The use of "choice" instead of "label" was intentional since the localization automation uses "label" as a key.

    // #todo Consider using placeholder for the text boxes.
    // #todo Consider defaulting new choices to use the index of the choice.

    const newPrompt = 
    {
      title: 'Prompt Title',
      description: 'Prompt Description.',
      choices: [
        {
          name: 'Choice 1',
          value: 1,
        },
        {
          name: 'Choice 2',
          value: 2,
        },
      ],
    };

    this.item.system.prompts.push(newPrompt);

    this.item.update({ 'system.prompts': this.item.system.prompts });

    console.log(this.item);
    console.log(this.item.system);
  }

  /**
   * Handle removal of an item.
   * @param {Event} event The originating click event
   * @private
   */
  async _onItemRemovePrompt(event) {
    const itemPrompt = $(event.currentTarget).parents('.item-prompt');
    const promptIndex = itemPrompt.data('promptIndex');

    this.item.system.prompts.splice(promptIndex, 1);

    this.item.update({ 'system.prompts': this.item.system.prompts });
  }

  /**
   * Handle the change of a prompts title.
   * @param {Event} event The originating changed event
   * @private
   */
  async _onItemPromptTitleChange(event) {
    const itemPrompt = $(event.currentTarget).parents('.item-prompt');
    const promptIndex = itemPrompt.data('promptIndex');

    let prompt = this.item.system.prompts[promptIndex];
    prompt.title = event.currentTarget.value;

    this.item.update({ 'system.prompts': this.item.system.prompts });
  }

  /**
   * Handle the change of a prompts description.
   * @param {Event} event The originating changed event
   * @private
   */
  async _onItemPromptDescriptionChange(event) {
    const itemPrompt = $(event.currentTarget).parents('.item-prompt');
    const promptIndex = itemPrompt.data('promptIndex');

    let prompt = this.item.system.prompts[promptIndex];
    prompt.description = event.currentTarget.value;

    this.item.update({ 'system.prompts': this.item.system.prompts });
  }

  /**
   * Handle the change of a prompts choice name.
   * @param {Event} event The originating changed event
   * @private
   */
  async _onItemPromptChoiceNameChange(event) {
    const itemPrompt = $(event.currentTarget).parents('.item-prompt');
    const promptIndex = itemPrompt.data('promptIndex');
    const choicePrompt = $(event.currentTarget).parents('.item-prompt-choice');
    const choiceIndex = choicePrompt.data('choiceIndex');

    let prompt = this.item.system.prompts[promptIndex];
    prompt.choices[choiceIndex].name = event.currentTarget.value;

    this.item.update({ 'system.prompts': this.item.system.prompts });
  }

  /**
   * Handle the change of a prompts choice value.
   * @param {Event} event The originating changed event
   * @private
   */
  async _onItemPromptChoiceValueChange(event) {
    const itemPrompt = $(event.currentTarget).parents('.item-prompt');
    const promptIndex = itemPrompt.data('promptIndex');
    const choicePrompt = $(event.currentTarget).parents('.item-prompt-choice');
    const choiceIndex = choicePrompt.data('choiceIndex');

    let prompt = this.item.system.prompts[promptIndex];
    prompt.choices[choiceIndex].value = event.currentTarget.value;

    this.item.update({ 'system.prompts': this.item.system.prompts });
  }
}

/**
 * Connect the item hooks to the foundry hook system.
 */
export function connectItemHooks() {
  Hooks.on('renderChatLog', (_app, html, _data) => {
    html.on('click', '.fh-spend-mana', _handleManaSpend);
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
  sendActorMessage(`<b>${actor.name}</b> spent ${manaCost} mana.`);
}
