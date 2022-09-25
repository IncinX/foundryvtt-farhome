export function createCompendiumFrom5etoolsBeastiary(rulesUrl) {
  // #note This creates a world compendium. System compendiums are automatically created if they are defined in their system.json

  // #todo Need to check if the compendium exists already

  CompendiumCollection.createCompendium({
    name: 'monster-compendium',
    label: 'Monster Compendium',
    type: 'Actor',
    system: 'farhome',
    package: 'system',
  });

  // #todo If I can add a bunch of data to this on document creation, it will make it much more unit-testable if I have a parsing function that returns the data in a json layout, ready for document creation.

  let farhomeActor = game.farhome.FarhomeActor.createDocuments(
    [
      {
        name: 'TestActor',
        type: 'npc',
        data: {
          race: {
            value: 'Human',
          },
          attributes: {
            str: { value: 3 },
            dex: { value: 2 },
          },
        },
      },
    ],
    {
      pack: 'world.monster-compendium',
    },
  );
}
