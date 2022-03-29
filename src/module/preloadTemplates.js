export async function preloadTemplates() {
  const templatePaths = [
    "systems/farhome/templates/partials/character-stat.hbs",
    "systems/farhome/templates/partials/character-stat-block.hbs",
  ];

  return loadTemplates(templatePaths);
}
