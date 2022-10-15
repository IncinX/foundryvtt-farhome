import { onManageActiveEffect, prepareActiveEffectCategories } from '../core/effects.js';
import { localizeObject } from '../core/localization.js';
import { getEffectData, getEffectHtml } from '../core/effects';
import { sendChatRoll } from '../roller/roller.js';

// #todo Add Poison/Hex icons later

/**
 * Extend the basic ActorSheet to implement Farhome specifics.
 * @extends {ActorSheet}
 */
export default class FarhomeActorSheet extends ActorSheet {
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
    return `systems/farhome/templates/sheets/actor/${this.actor.data.type}-sheet.hbs`;
  }

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Add the farhome configuration so it is available in handlebars.
    context.config = CONFIG.FARHOME;

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.data.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.data;
    context.flags = actorData.flags;

    // Prepare the items
    this._prepareActorData(context);
    this._prepareItems(context);

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareNpcData(context);
    }

    // Add roll data for TinyMCE editors.
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
    localizeObject(null, context.data);
  }

  /**
   * Prepare the character derived sheet-specific data.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Nothing to do right now.
  }

  /**
   * Prepare the npc derived sheet-specific data.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareNpcData(context) {
    // Nothing to do right now.
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
    const money = [];
    const inventory = [];
    const weapons = [];
    const armors = [];
    const feats = [];
    const maneuvers = [];
    const consumables = [];
    const craftingItems = [];
    const spells = {
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
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.data.spellLevel.value !== null) {
          spells[i.data.spellLevel.value].push(i);
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

    // Item quantities
    html.find('.item-quantity-input').change(this._onItemQuantityChanged.bind(this));

    // Active Effect management
    // #todo Add support for effects
    html.find('.effect-control').click((ev) => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
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
      data: {},
    };

    // Populate the spell item
    if (type === 'spell') {
      itemData.data.spellLevel = {
        value: parseInt(controlData.spellLevel),
      };
    }

    // Setup a custom template depending on the item type.
    const actorData = this.actor.data.data;

    if (type === 'armor') {
      const rollTemplateHtml = await renderTemplate(
        'systems/farhome/templates/item-roll-templates/armor-item-roll-template.hbs',
      );
      itemData.data.rollTemplate = {
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
        itemData.data.rollTemplate = {
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
        itemData.data.rollTemplate = {
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

      itemData.data.rollTemplate = {
        value: rollTemplateHtml,
      };
    } else {
      const rollTemplateHtml = await renderTemplate(
        'systems/farhome/templates/item-roll-templates/default-item-roll-template.hbs',
      );

      itemData.data.rollTemplate = {
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
    item.delete();

    // #todo I don't think this sliding motion actually works, add it later.
    li.slideUp(200, () => this.render(false));
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
    await item.update({ 'data.equipped.value': event.target.checked });
  }

  /**
   * Handle attuned change of an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemAttunedChanged(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    await item.update({ 'data.attuned.value': event.target.checked });
  }

  /**
   * Handle prepared change of an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemPreparedChanged(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    await item.update({ 'data.prepared.value': event.target.checked });
  }

  /**
   * Handle quantity changes of an Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemQuantityChanged(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    await item.update({ 'data.quantity.value': parseInt(event.target.value) });
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
      const actorContext = this.actor.data;
      const activeEffectData = getEffectData(actorContext);
      const activeEffectsHtml = await getEffectHtml(activeEffectData);

      // Send the chat roll for display (along with summary calculation, etc.)
      return sendChatRoll(evaluatedRollHtml, activeEffectsHtml);
    }
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
