export async function preloadTemplates() {
  const templatePaths = [
    "systems/farhome/templates/partials/character-stat-block.hbs",
    "systems/farhome/templates/partials/character-ability-block.hbs",
  ];

  return loadTemplates(templatePaths);
}
