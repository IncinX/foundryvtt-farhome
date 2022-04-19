export async function preloadTemplates() {
  const templatePaths = [
    'systems/farhome/templates/partials/attribute-partial.hbs',
    'systems/farhome/templates/partials/max-resource-partial.hbs',
    'systems/farhome/templates/partials/resource-partial.hbs',
    'systems/farhome/templates/partials/row-rollable-number-partial.hbs',
    'systems/farhome/templates/partials/row-number-partial.hbs',
    'systems/farhome/templates/partials/row-bool-partial.hbs',
    'systems/farhome/templates/partials/row-select-partial.hbs',
    'systems/farhome/templates/partials/row-string-partial.hbs',
    'systems/farhome/templates/partials/item-header-partial.hbs',
  ];

  return loadTemplates(templatePaths);
}
