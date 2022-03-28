export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
  const templatePaths: string[] = [
    // Add paths to "systems/farhome/templates"
  ];

  return loadTemplates(templatePaths);
}
