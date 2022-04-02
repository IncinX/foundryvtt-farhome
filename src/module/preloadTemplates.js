export async function preloadTemplates() {
  const templatePaths = [
    'systems/farhome/templates/partials/attribute-partial.hbs',
    'systems/farhome/templates/partials/max-resource-partial.hbs',
    'systems/farhome/templates/partials/resource-partial.hbs',
  ];

  return loadTemplates(templatePaths);
}
