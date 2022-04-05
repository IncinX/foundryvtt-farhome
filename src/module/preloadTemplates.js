export async function preloadTemplates() {
  const templatePaths = [
    'systems/farhome/templates/partials/attribute-partial.hbs',
    'systems/farhome/templates/partials/max-resource-partial.hbs',
    'systems/farhome/templates/partials/resource-partial.hbs',
    'systems/farhome/templates/partials/rollable-number-proficiency-partial.hbs',
    'systems/farhome/templates/partials/number-proficiency-partial.hbs',
    'systems/farhome/templates/partials/bool-proficiency-partial.hbs',
    'systems/farhome/templates/partials/item-header-partial.hbs',
  ];

  return loadTemplates(templatePaths);
}
