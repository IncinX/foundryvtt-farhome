// TODO Create auto helper methods to go into template and add a derived label field that auto-resolves localization to farhome.<field_name>
//      Basically if something is of type 'object' then it will add a label field and attempt to localize it with defaulting to the original name on fallback and logging a warning to console.
// TODO Use Handlebars If logic to customize the actor sheet based on the actor type.  Only create a seperate sheet if it's absolutely necessary.
// TODO A lot of the functionality on this sheet was built from the BOILERPLATE from the https://gitlab.com/asacolips-projects/foundry-mods/boilerplate/-/blob/master/module/sheets/actor-sheet.mjs project and likely needs to be modified for FARHOME.
// TODO Add mana deduction

import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.js';
import { localizeObject } from '../helpers/localization.js';
import { _getDefaultRollTemplate } from '../helpers/roll-templates.js';

// TODO Add Poison/Hex icons later

/**
 * Extend the basic ActorSheet to implement Farhome specifics.
 * @extends {ActorSheet}
 */
export default class FarhomeActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['farhome', 'sheet', 'actor'],
      width: 800,
      height: 800,
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

    // TODO Consider removing weapon and armor as separate types and just embed the fields as part of the item.
    // TODO The user can then customize the ability.  I could add an isWeapon or isArmor field later if necessary.
    // TODO Add the ability to do inline rolls.

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

    html.find('.item-name-link').click(this._onItemRoll.bind(this));

    // Active Effect management
    // TODO Add support for effects
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
    const data = duplicate(header.dataset);

    // Initialize a default name.
    const name = `New ${type.capitalize()}`;

    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: {},
    };

    if (type === 'spell') {
      itemData.data.spellLevel = {
        value: parseInt(data.spellLevel),
      };
    }

    // TODO When a new item of a type is created, it should fill the rollTemplate field with an appropriate template for it's type.
    //      This roll template should vary depending on type.
    itemData.data.rollTemplate = {
      value: _getDefaultRollTemplate(),
    };

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

    // TODO I don't think this sliding motion actually works, add it later.
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
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
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
      let label = dataset.label ?? '';
      console.log(game.specialDiceRoller);
      let roll = game.specialDiceRoller.fh.rollFormula(dataset.roll);
      let results_html = `<h1>${label}</h1>${roll}`;
      
      // Roll mode controls what chat it goes to
      const rollMode = game.settings.get('core', 'rollMode');

      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        //speaker: ChatMessage.getSpeaker({token: actor}),
        rollMode: rollMode,
        content: results_html,
      });
      return roll;
    }
  }
}
