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

    // Prompts work on everything but notes for now
    if (!['note'].includes(this.item.type)) {
      // Run the TextEditor.enrichHTML on prompt description entries
      // This prompt system treats an object like an array with numerical indexes as keys.
      // This is due to the fact that handlebars does not support updating entries in array fields well, particularly for the description field.
      const promptMaxIndex = context.system.prompts.maxIndex ?? 0;
      for (let promptIndex = 0; promptIndex < promptMaxIndex; promptIndex++) {
        let prompt = context.system.prompts[`${promptIndex}`];
        prompt.description.enriched = await this._enrichTextHTML(prompt.description);
        prompt.description.targetPath = `system.prompts.${promptIndex}.description.value`;
      }
    }

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
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll Handler
    html.find('.item-roll').click((ev) => this.item.roll());

    // Prompts
    html.find('.item-add-prompt').click(this._onItemAddPrompt.bind(this));
    html.find('.item-remove-prompt').click(this._onItemRemovePrompt.bind(this));
    html.find('.item-add-choice').click(this._onItemAddChoice.bind(this));
    html.find('.item-remove-choice').click(this._onItemRemoveChoice.bind(this));
    html.find('.item-prompt-title-input').change(this._onItemPromptTitleChange.bind(this));
    html.find('.item-prompt-description-input').change(this._onItemPromptDescriptionChange.bind(this));
    html.find('.item-prompt-variable-input').change(this._onItemPromptVariableChange.bind(this));
    html.find('.item-prompt-choice-name-input').change(this._onItemPromptChoiceNameChange.bind(this));
    html.find('.item-prompt-choice-value-input').change(this._onItemPromptChoiceValueChange.bind(this));
  }

  /**
   * Handle adding a new prompt to an item.
   * @param {Event} _event The originating click event
   * @private
   * @note Due to the nature of the templates with an embedded object. It was decided to update the entire object when changes are made.
   * @note The use of "choice" instead of "label" was intentional since the localization automation uses "label" as a key.
   */
  async _onItemAddPrompt(event) {
    event.preventDefault();

    // #todo Fix localization for placeholder options
    // #todo Should change this to a proper javascript Object and use that in documentation
    const maxIndex = this.item.system.prompts.maxIndex ?? 0;

    const newPrompt = {
      isValid: true, // Used to indicate to handlebars that this is a valid prompt object since it is being similar to an array.
      title: {
        value: `Prompt Title ${maxIndex}`,
      },
      description: {
        value: `Description for item ${maxIndex}`,
      },
      variable: {
        value: `promptVariable${maxIndex}`,
      },
      choices: [],
    };

    this.item.system.prompts[`${maxIndex}`] = newPrompt;
    this.item.system.prompts['maxIndex'] = maxIndex + 1;

    await this._updatePrompts();
  }

  /**
   * Handle removal of an item.
   * @param {Event} event The originating click event
   * @private
   */
  async _onItemRemovePrompt(event) {
    // Since this is an object and not an array, it simply marks the entry as no longer being a prompt.
    // This is also due to the fact that foundry does merges when it does an update as opposed to deleting fields.
    // In this case, we always add new prompts to the end of the object and never remove existing entries, we just hide them instead.
    const promptIndex = this._getPromptIndex(event);
    await this.item.update({ [`system.prompts.${promptIndex}.isValid`]: false });
  }

  /**
   * Handle addition of a choice.
   * @param {Event} event The originating click event
   * @private
   */
  async _onItemAddChoice(event) {
    // #todo Fix localization for placeholder options
    let prompt = this.item.system.prompts[this._getPromptIndex(event)];
    const newChoice = {
      name: {
        value: `New Choice ${prompt.choices.length}`,
      },
      variableValue: {
        value: `${prompt.choices.length}`,
      },
    };

    prompt.choices.push(newChoice);

    await this._updatePrompts();
  }

  /**
   * Handle removal of a choice.
   * @param {Event} event The originating click event
   * @private
   */
  async _onItemRemoveChoice(event) {
    this.item.system.prompts[this._getPromptIndex(event)].choices.splice(this._getChoiceIndex(event), 1);

    await this._updatePrompts();
  }

  /**
   * Handle the change of a prompts title.
   * @param {Event} event The originating changed event
   * @private
   */
  async _onItemPromptTitleChange(event) {
    let prompt = this.item.system.prompts[this._getPromptIndex(event)];
    prompt.title.value = event.currentTarget.value;

    await this._updatePrompts();
  }

  /**
   * Handle the change of a prompts description.
   * @param {Event} event The originating changed event
   * @private
   */
  async _onItemPromptDescriptionChange(event) {
    let prompt = this.item.system.prompts[this._getPromptIndex(event)];
    prompt.description.value = event.currentTarget.value;

    await this._updatePrompts();
  }

  /**
   * Handle the change of a prompts variable.
   * @param {Event} event The originating changed event
   * @private
   */
  async _onItemPromptVariableChange(event) {
    let prompt = this.item.system.prompts[this._getPromptIndex(event)];
    prompt.variable.value = event.currentTarget.value;

    await this._updatePrompts();
  }

  /**
   * Handle the change of a prompts choice name.
   * @param {Event} event The originating changed event
   * @private
   */
  async _onItemPromptChoiceNameChange(event) {
    let prompt = this.item.system.prompts[this._getPromptIndex(event)];
    prompt.choices[this._getChoiceIndex(event)].name.value = event.currentTarget.value;

    await this._updatePrompts();
  }

  /**
   * Handle the change of a prompts choice value.
   * @param {Event} event The originating changed event
   * @private
   */
  async _onItemPromptChoiceValueChange(event) {
    let prompt = this.item.system.prompts[this._getPromptIndex(event)];
    prompt.choices[this._getChoiceIndex(event)].variableValue.value = event.currentTarget.value;

    await this._updatePrompts();
  }

  /**
   * Updates the prompts field of an item.
   * @private
   */
  async _updatePrompts() {
    await this.item.update({ 'system.prompts': this.item.system.prompts });
  }

  /**
   * Retrieves the promptIndex of a parent item-prommpt element.
   * @param {Event} event The originating changed event
   * @private
   */
  _getPromptIndex(event) {
    const itemPrompt = $(event.currentTarget).parents('.item-prompt');
    const promptIndex = itemPrompt.data('promptIndex');
    return promptIndex;
  }

  /**
   * Retrieves the choiceIndex of a parent item-prompt-choice element.
   * @param {Event} event The originating changed event
   * @private
   */
  _getChoiceIndex(event) {
    const choicePrompt = $(event.currentTarget).parents('.item-prompt-choice');
    const choiceIndex = choicePrompt.data('choiceIndex');
    return choiceIndex;
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
