import { getEffectData, getEffectHtml, onManageActiveEffect, prepareActiveEffectCategories } from '../core/effects';
import { localizeObject } from '../core/localization';
import { findMessageContentNode, sendActorMessage } from '../core/chat';
import { sendChatRoll } from '../roller/roller';

// #todo Add Poison/Hex icons later

/**
 * Extend the basic ActorSheet to implement Farhome specifics.
 * @extends {ActorSheet}
 */
export class FarhomeActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['farhome', 'sheet', 'actor'],
      width: 850,
      height: 800,
      minWidth: 850,
      minHeight: 800,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'attributes' }],
    });
  }

  /** @override */
  get template() {
    return `systems/farhome/templates/sheets/actor/${this.actor.type}-sheet.hbs`;
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
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.system for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare the items
    this._prepareActorData(context);
    this._prepareItems(context);

    // Prepare character data and items.
    if (actorData.type == 'character') {
      await this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      await this._prepareNpcData(context);
    }

    // Add roll data for TinyMCE editors.
    // #todo I don't think this is necessary anymore
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Prepare the actor derived sheet-specific data (common to character and npc)
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareActorData(context) {
    // Do derived localization of the entire context data.
    localizeObject(null, context.system);
  }

  /**
   * Prepare the character derived sheet-specific data.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  async _prepareCharacterData(context) {
    context.enrichedText = {
      biography: await TextEditor.enrichHTML(context.system.biography.value, { async: true }),
    };
  }

  /**
   * Prepare the npc derived sheet-specific data.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  async _prepareNpcData(context) {
    // #todo This is duplicated with character data above but it doesn't apply for stashes. Consider refactoring.
    context.enrichedText = {
      biography: await TextEditor.enrichHTML(context.system.biography.value, { async: true }),
    };

  }

  /**
   * Prepare the items for the character sheet.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    let money = [];
    let inventory = [];
    let weapons = [];
    let armors = [];
    let feats = [];
    let maneuvers = [];
    let consumables = [];
    let craftingItems = [];
    let notes = [];
    let spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to money
      if (i.type === 'money') {
        money.push(i);
      }
      // Append to inventory.
      else if (i.type === 'item') {
        inventory.push(i);
      }
      // Append to weapons.
      else if (i.type === 'weapon') {
        weapons.push(i);
      }
      // Append to armor.
      else if (i.type === 'armor') {
        armors.push(i);
      }
      // Append to feats.
      else if (i.type === 'feat') {
        feats.push(i);
      }
      // Append to maneuvers.
      else if (i.type === 'maneuver') {
        maneuvers.push(i);
      }
      // Append to consuambles.
      else if (i.type === 'consumable') {
        consumables.push(i);
      }
      // Append to crafting materials
      else if (i.type === 'crafting') {
        craftingItems.push(i);
      }
      // Append to notes
      else if (i.type === 'note') {
        notes.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel.value !== null) {
          spells[i.system.spellLevel.value].push(i);
        }
      }
    }

    // Assign and return
    context.money = money;
    context.inventory = inventory;
    context.weapons = weapons;
    context.armors = armors;
    context.feats = feats;
    context.maneuvers = maneuvers;
    context.consumables = consumables;
    context.craftingItems = craftingItems;
    context.notes = notes;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(this._onItemEdit.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(this._onItemDelete.bind(this));

    // Rollable Inventory Item
    html.find('.item-name-link').click(this._onItemRoll.bind(this));

    // Equipped/Attuned/Prepared Item Checkboxes
    html.find('.item-equipped-input').change(this._onItemEquippedChanged.bind(this));
    html.find('.item-attuned-input').change(this._onItemAttunedChanged.bind(this));
    html.find('.item-prepared-input').change(this._onItemPreparedChanged.bind(this));

    // Item charges
    html.find('.item-charges-input').change(this._onItemChargesChanged.bind(this));

    // Item quantities
    html.find('.item-quantity-input').change(this._onItemQuantityChanged.bind(this));

    // Active Effect management
    // #todo Add support for effects
    html.find('.effect-control').click((ev) => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Mana refill
    html.find('.mana-refill').click(this._onManaRefill.bind(this));

    // Healing surges
    html.find('.healing-surge').click(this._onHealingSurge.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        // Skip headers
        if (li.classList.contains('items-header')) return;
        if (li.classList.contains('item-divider')) return;

        // Setup draggable items
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;

    // Get the type of item to create.
    const type = header.dataset.type;

    // Grab any data associated with this control.
    const controlData = duplicate(header.dataset);

    // Initialize a default name.
    // #todo Add localization
    const name = `New ${type.capitalize()}`;

    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: {},
    };

    // Populate the spell item
    if (type === 'spell') {
      itemData.system.spellLevel = {
        value: parseInt(controlData.spellLevel),
      };
    }

    // Setup a custom template depending on the item type.
    const actorData = this.actor.system;

    if (type === 'armor') {
      const rollTemplateHtml = await renderTemplate(
        'systems/farhome/templates/item-roll-templates/armor-item-roll-template.hbs',
      );
      itemData.system.rollTemplate = {
        value: rollTemplateHtml,
      };
    } else if (type === 'weapon' || type === 'maneuver') {
      const relevantWeaponAttributes = {
        str: actorData.attributes.str,
        dex: actorData.attributes.dex,
      };

      const strongestWeaponProficiency = FarhomeActorSheet._getStrongestKey(actorData.proficiencies.weapons);
      const strongestAttribute = FarhomeActorSheet._getStrongestKey(relevantWeaponAttributes);

      if (type === 'weapon') {
        const rollTemplateHtml = await renderTemplate(
          'systems/farhome/templates/item-roll-templates/weapon-item-roll-template.hbs',
          {
            strongestProf: `a.${strongestWeaponProficiency}`,
            strongestAttr: `a.${strongestAttribute}`,
          },
        );
        itemData.system.rollTemplate = {
          value: rollTemplateHtml,
        };
      } else {
        const rollTemplateHtml = await renderTemplate(
          'systems/farhome/templates/item-roll-templates/maneuver-item-roll-template.hbs',
          {
            strongestProf: `a.${strongestWeaponProficiency}`,
            strongestAttr: `a.${strongestAttribute}`,
          },
        );
        itemData.system.rollTemplate = {
          value: rollTemplateHtml,
        };
      }
    } else if (type === 'spell') {
      const relevantSpellAttributes = {
        sta: actorData.attributes.sta,
        int: actorData.attributes.int,
        will: actorData.attributes.will,
        cha: actorData.attributes.cha,
      };

      const strongestSpellProficiency = FarhomeActorSheet._getStrongestKey(actorData.proficiencies.spells);
      const strongestAttribute = FarhomeActorSheet._getStrongestKey(relevantSpellAttributes);

      const rollTemplateHtml = await renderTemplate(
        'systems/farhome/templates/item-roll-templates/spell-item-roll-template.hbs',
        {
          strongestProf: `a.${strongestSpellProficiency}`,
          strongestAttr: `a.${strongestAttribute}`,
        },
      );

      itemData.system.rollTemplate = {
        value: rollTemplateHtml,
      };
    } else if (type === 'note') {
      // Do nothing since it doesn't have a roll template.
    } else {
      const rollTemplateHtml = await renderTemplate(
        'systems/farhome/templates/item-roll-templates/default-item-roll-template.hbs',
      );

      itemData.system.rollTemplate = {
        value: rollTemplateHtml,
      };
    }

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle editing an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemEdit(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    item.sheet.render(true);
  }

  /**
   * Handle deleting an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemDelete(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));

    // First get confirmation
    let confirmationDialog = new Dialog({
      title: `Delete ${item.name}?`,
      content: `<div class='delete-data' data-actor-id='${this.actor.id}' data-item-id='${item.id}'>Are you sure you want to delete ${item.name}?</div>`,
      buttons: {
        delete: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Delete',
          callback: (html) => {
            const primaryDiv = html.find('.delete-data')[0];
            const actor = game.actors.get(primaryDiv.dataset.actorId);
            let item = actor.items.get(primaryDiv.dataset.itemId);
            item.delete();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
        },
      },
      default: 'cancel',
    });

    confirmationDialog.render(true);
  }

  /**
   * Handle rolling an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemRoll(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    item.roll();
  }

  /**
   * Handle equipped change of an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemEquippedChanged(event) {
    // #todo Code duplication between all this and attuned/prepared can probably be reduced by binding a string parameter for the data path.
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    await item.update({ 'system.equipped.value': event.target.checked });
  }

  /**
   * Handle attuned change of an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemAttunedChanged(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    await item.update({ 'system.attuned.value': event.target.checked });
  }

  /**
   * Handle prepared change of an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemPreparedChanged(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    await item.update({ 'system.prepared.value': event.target.checked });
  }

  /**
   * Handle charges changes of an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemChargesChanged(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    await item.update({ 'system.charges.value': parseInt(event.target.value) });
  }

  /**
   * Handle quantity changes of an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemQuantityChanged(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    await item.update({ 'system.quantity.value': parseInt(event.target.value) });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      const label = dataset.label ?? '';
      const rollHtml = await game.farhome.roller.evaluateRollFormula(dataset.roll);

      // Render the skill using the header-roll template
      const evaluatedRollHtml = await renderTemplate('systems/farhome/templates/chat/header-roll.hbs', {
        label: label,
        roll: rollHtml,
      });

      // Evaluate the active effects for the character (ie/ hex, poison, etc)
      const activeEffectData = getEffectData(this.actor);
      const activeEffectsHtml = await getEffectHtml(activeEffectData);

      // Send the chat roll for display (along with summary calculation, etc.)
      return sendChatRoll(evaluatedRollHtml, activeEffectsHtml);
    }
  }

  /**
   * Handle healing surge clicks.
   * @param {Event} event The originating click event
   */
  async _onHealingSurge(event) {
    event.preventDefault();

    const actorContext = this.actor.system;
    const currentHealingSurges = actorContext.features.healingSurges.value;

    if (currentHealingSurges > 0) {
      const healingSurgeRollHtml = await game.farhome.roller.evaluateRollFormula('www');

      const healingSurgeMessageHtml = await renderTemplate('systems/farhome/templates/chat/header-roll.hbs', {
        label: game.i18n.localize('farhome.healingSurge'),
        roll: healingSurgeRollHtml,
      });

      // Spend the healing surge
      this.actor.update({ 'system.features.healingSurges.value': currentHealingSurges - 1 });

      const healingSurgeData = {
        actorId: this.actor.id,
      };

      // #todo This would be cleaner if sendChatRoll used named arguments or had a named argument object.
      await sendChatRoll(healingSurgeMessageHtml, '', undefined, healingSurgeData);
    } else {
      await sendActorMessage(`${this.actor.name} has no healing surges left to spend.`);
    }
  }

  /**
   * Handle mana refill clicks.
   * @param {Event} event The originating click event
   */
  async _onManaRefill(event) {
    event.preventDefault();

    const actorContext = this.actor.system;

    const manaRefillValue = Math.max(Math.ceil(actorContext.level.value / 2), 1);
    const newManaValue = Math.min(actorContext.features.mana.max, actorContext.features.mana.value + manaRefillValue);

    this.actor.update({ 'system.features.mana.value': newManaValue });

    await sendActorMessage(
      `<strong>${this.actor.name}</strong> restored ${newManaValue - actorContext.features.mana.value} mana.`,
    );
  }

  /**
   * Gets the name of the key in an object that has the highest value.
   * @param {Object} obj The object to search.
   * @returns {string} The name of the key with the highest value.
   * @private
   */
  static _getStrongestKey(obj) {
    let strongestKey = null;
    let strongestValue = -Infinity;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key].value;
        if (value > strongestValue) {
          strongestKey = key;
          strongestValue = value;
        }
      }
    }
    return strongestKey;
  }
}

/**
 * Connect the item hooks to the foundry hook system.
 */
export function connectActorHooks() {
  Hooks.on('renderChatLog', (_app, html, _data) => {
    html.on('click', '.fh-apply-healing', _handleApplyHealing);
  });
}

/**
 * Handle click message generated from the "Apply Healing" button in chat.
 * @param {Event} event   The originating click event
 * @private
 */
async function _handleApplyHealing(event) {
  event.preventDefault();

  // Disable the button
  event.currentTarget.disabled = true;

  // Get the data from the button
  let actorId = event.currentTarget.dataset.actorId;

  // Check for ownership
  let actor = game.actors.get(actorId);
  if (!actor.isOwner) {
    sendActorMessage('You do not own this actor, so stop trying to apply their healing surge.');
    return;
  }

  // Calculate the healed amount
  const actorContext = actor.system;

  const messageContentNode = findMessageContentNode(event.currentTarget);
  const rollSummaryNode = messageContentNode.querySelector('.fh-roll-summary');

  const rolledHealedWounds = parseInt(rollSummaryNode.dataset.wounds);
  const maxHealAmount = actorContext.features.wounds.max - actorContext.features.wounds.value;
  const healedWounds = Math.min(rolledHealedWounds, maxHealAmount);

  // Apply the healing
  actor.update({ 'system.features.wounds.value': actorContext.features.wounds.value + healedWounds });

  // Send the confirmation message to the chat
  sendActorMessage(`<strong>${actor.name}</strong> healed ${healedWounds} wounds.`);
}
