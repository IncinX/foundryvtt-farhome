// #note Ve refers to 5th-edition with V as a roman numeral since numerical prefixes cause issues in programming.
export async function createCompendiumFromVetoolsBeastiary(compendiumLabel, beastiaryUrl, deleteExisting = true) {
  // #note This creates a world compendium. System compendiums are automatically created if they are defined in their system.json

  const beastiaryFetch = await fetch(beastiaryUrl);
  const beastiaryBlob = await beastiaryFetch.blob();
  const beastiaryText = await beastiaryBlob.text();
  const beastiaryJson = JSON.parse(beastiaryText);

  console.log(beastiaryJson);

  // #todo Add lighting information based on vision
  let monsterDocumentData = [];

  for (const monster of beastiaryJson.monster) {
    const monsterImgUri = _getImageLink(monster.source, monster.name);
    const newMonsterDocument = {
      name: monster.name,
      type: 'npc',
      img: monsterImgUri,
      token: {
        ..._convertTokenSize(monster.size),
        img: monsterImgUri,
      },
      data: {
        race: {
          value: monster.type,
        },
        background: {
          value: _convertAlignment(monster.alignment),
        },
        attributes: {
          str: { value: _convertAttribute(monster.str) },
          dex: { value: _convertAttribute(monster.dex) },
          sta: { value: _convertAttribute(monster.con) },
          int: { value: _convertAttribute(monster.int) },
          will: { value: _convertAttribute(monster.wis) },
          cha: { value: _convertAttribute(monster.cha) },
        },
      },
    };

    monsterDocumentData.push(newMonsterDocument);
  }

  console.log(monsterDocumentData);

  // Create the compendium
  const compendiumName = compendiumLabel.toLowerCase().replace(/ /g, '-');
  const worldCompendiumName = `world.${compendiumName}`;

  if (deleteExisting) {
    if (game.packs.has(worldCompendiumName)) {
      await game.packs.get(worldCompendiumName).deleteCompendium();
    }
  }

  await CompendiumCollection.createCompendium({
    name: compendiumName,
    label: compendiumLabel,
    type: 'Actor',
    system: 'farhome',
    package: 'system',
  });

  // #todo If I can add a bunch of data to this on document creation, it will make it much more unit-testable if I have a parsing function that returns the data in a json layout, ready for document creation.

  // Create the compendium documents
  await game.farhome.FarhomeActor.createDocuments(monsterDocumentData, { pack: worldCompendiumName });
}

function _convertTokenSize(veSize) {
  switch (veSize.toUpperCase()) {
    default:
    case 'S':
    case 'M':
      return { width: 1, height: 1 };
    case 'L':
      return { width: 2, height: 2 };
    case 'H':
      return { width: 3, height: 3 };
    case 'G':
      return { width: 4, height: 4 };
    case 'T':
      return { width: 0.5, height: 0.5 };
  }
}

function _convertAlignment(veAlignment) {
  const alignmentMap = {
    L: 'Lawful',
    N: 'Neutral',
    C: 'Chaotic',
    G: 'Good',
    E: 'Evil',
  };

  const expandedAlignment = veAlignment.map((element) => alignmentMap[element]);

  return expandedAlignment.join(' ');
}

function _convertAttribute(veAttribute) {
  return Math.floor((veAttribute - 10) / 2);
}

function _getImageLink(veSource, veName) {
  const veSourceUriComponent = encodeURIComponent(veSource.replace('3pp', '(3pp)'));
  const veNameUriComponent = encodeURIComponent(veName);
  return `https://raw.githubusercontent.com/IncinX/5etools/master/img/${veSourceUriComponent}/${veNameUriComponent}.png`;
}
