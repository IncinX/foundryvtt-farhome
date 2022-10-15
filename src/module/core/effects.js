export function populateStatusEffectsFromCompendium(compendiumName) {
  const conditions = game.packs.get(compendiumName);
  conditions.getDocuments().then((conditionDocuments) => {
    // Clear the current status effects
    CONFIG.statusEffects = [];

    for (const conditionDocument of conditionDocuments) {
      const conditionId = conditionDocument.data.name.toLowerCase().replace(' ', '-');
      const effectData = {
        id: conditionId,
        label: `farhome.${conditionId}`,
        icon: conditionDocument.data.img,
      };

      CONFIG.statusEffects.push(effectData);
    }

    // Sort the list by label
    CONFIG.statusEffects.sort((a, b) => a.label > b.label ? 1 : -1);
  });
}