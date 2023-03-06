/**
 * Overrides the farhome game status effects in favor of farhome status effects.
 * @param {String} compendiumName The name of the compendium to enumerate for condition effects.
 */
export function populateStatusEffectsFromCompendium(compendiumName) {
  const conditions = game.packs.get(compendiumName);
  conditions.getDocuments().then((conditionDocuments) => {
    // Clear the current status effects
    CONFIG.statusEffects = [];

    for (const conditionDocument of conditionDocuments) {
      const conditionId = conditionDocument.name.toLowerCase().replace(' ', '-');
      const effectData = {
        id: conditionId,
        label: `farhome.${conditionId}`,
        icon: conditionDocument.img,
      };

      CONFIG.statusEffects.push(effectData);
    }

    // Sort the list by label
    CONFIG.statusEffects.sort((a, b) => (a.label > b.label ? 1 : -1));
  });
}

/**
 * Examines the active effects on an actor and returns a numerical effect summary.
 * @param {Object} actorContext The actor data context to examine.
 * @returns {Object} An object containing the numerical effect summary (such as hex and poison).
 */
export function getEffectData(actorContext) {
  let effectsData = {
    hex: 0,
    poison: 0,
    blind: 0,
    exhaustion: 0,
  };

  for (const effect of actorContext.effects) {
    const effectStatusId = effect.flags.core.statusId;

    if (effectStatusId.startsWith('hex')) {
      effectsData.hex += parseInt(effectStatusId.split('-')[1]);
    } else if (effectStatusId.startsWith('poison')) {
      effectsData.poison += parseInt(effectStatusId.split('-')[1]);
    } else if (effectStatusId.startsWith('blind')) {
      effectsData.blind = 1;
    } else if (effectStatusId.startsWith('exhaustion')) {
      effectsData.exhaustion += parseInt(effectStatusId.split('-')[1]);
    }
  }

  return effectsData;
}

/**
 * Composite an html representation of the effect data to embed.
 * @param {Object} effectData Get the numerical effect data (@see getEffectData ).
 * @returns {String} The html representation of the effect data.
 */
export async function getEffectHtml(effectData) {
  const effectsHtml = await renderTemplate('systems/farhome/templates/chat/embedded-effect.hbs', effectData);

  return effectsHtml;
}

// #todo These functions below were part of the original template and currently isn't called.
/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
export function onManageActiveEffect(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  const li = a.closest('li');
  const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;

  switch (a.dataset.action) {
    case 'create':
      return owner.createEmbeddedDocuments('ActiveEffect', [
        {
          label: 'New Effect',
          icon: 'icons/svg/aura.svg',
          origin: owner.uuid,
          'duration.rounds': li.dataset.effectType === 'temporary' ? 1 : undefined,
          disabled: li.dataset.effectType === 'inactive',
        },
      ]);
    case 'edit':
      return effect.sheet.render(true);
    case 'delete':
      return effect.delete();
    case 'toggle':
      return effect.update({ disabled: !effect.disabled });
  }
}

/**
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects) {
  // Define effect header categories
  const categories = {
    temporary: {
      type: 'temporary',
      label: 'Temporary Effects',
      effects: [],
    },
    passive: {
      type: 'passive',
      label: 'Passive Effects',
      effects: [],
    },
    inactive: {
      type: 'inactive',
      label: 'Inactive Effects',
      effects: [],
    },
  };

  // Iterate over active effects, classifying them into categories
  for (let e of effects) {
    e._getSourceName(); // Trigger a lookup for the source name
    if (e.disabled) categories.inactive.effects.push(e);
    else if (e.isTemporary) categories.temporary.effects.push(e);
    else categories.passive.effects.push(e);
  }
  return categories;
}
