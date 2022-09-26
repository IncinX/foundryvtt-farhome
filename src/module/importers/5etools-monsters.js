export async function createCompendiumFrom5etoolsBeastiary(compendiumLabel, beastiaryUrl, deleteExisting = true) {
  // #note This creates a world compendium. System compendiums are automatically created if they are defined in their system.json

  const beastiaryFetch = await fetch(beastiaryUrl);
  const beastiaryBlob = await beastiaryFetch.blob();
  const beastiaryText = await beastiaryBlob.text();
  const beastiaryJson = JSON.parse(beastiaryText);

  console.log(beastiaryJson);

  // #todo Also need to configure the token size for the creature later
  for (const monster of beastiaryJson.monster) {
    console.log(monster.name);
  }

  return;

  // #todo Add parameter specifying whether to destroy existing compendium and receive the compendium label

  const compendiumName = compendiumLabel.toLowerCase().replace(/ /g, '-');
  const worldCompendiumName = `world.${compendiumName}`;

  if (deleteExisting) {
    if (game.packs.has(worldCompendiumName)) {
      await game.packs.get(worldCompendiumName).deleteCompendium();
    }
  }

  CompendiumCollection.createCompendium({
    name: compendiumName,
    label: compendiumLabel,
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
        token: {
          width: 2,
          height: 2,
        },
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
      pack: worldCompendiumName,
    },
  );
}
