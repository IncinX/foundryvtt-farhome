// #todo There are some bugs witht he bandit lord.
// #todo Also consider the balance within context of things like "Bandit Lord" which are closer to PC's in terms of balance.
// #todo Read this and tune the CR and HP calculations accordingly
//       https://github.com/IncinX/farhome-rules/blob/master/monstermanual.md

export class VetoolsMonsterImportConfig {
  constructor() {
    this.hpScale = 0.3;
    this.crScale = 1.0;
  }
}

// #note Ve refers to 5th-edition with V as a roman numeral since numerical prefixes cause issues in programming.
export async function createCompendiumFromVetoolsBeastiary(
  beastiaryUrl,
  compendiumLabel,
  vetoolsMonsterImportConfig = new VetoolsMonsterImportConfig(),
  progressCallback = undefined,
  deleteExisting = true,
) {
  // #note This creates a world compendium. System compendiums are automatically created if they are defined in their system.json

  const beastiaryFetch = await fetch(beastiaryUrl);
  const beastiaryBlob = await beastiaryFetch.blob();
  const beastiaryText = await beastiaryBlob.text();
  const beastiaryJson = JSON.parse(beastiaryText);

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

  // #todo Add lighting information based on vision

  // #todo Might be better to create the monster document first, then run an update() to add it's data, and then create item documents and add it to the actor document since I am sure if this will create the item documents properly.
  //       Test it out by creating just a simple feat with a random key id
  for (let monsterIndex = 0; monsterIndex < beastiaryJson.monster.length; monsterIndex++) {
    // Send the progress state to the callback
    if (typeof progressCallback === 'function') {
      progressCallback(monsterIndex, beastiaryJson.monster.length);
    }

    const monster = beastiaryJson.monster[monsterIndex];
    const monsterImgUri = _getImageLink(monster.source, monster.name);
    const monsterWounds = _convertHp(vetoolsMonsterImportConfig, monster.hp.average);

    // Construct the monster document
    const newMonsterDocument = {
      name: monster.name,
      type: 'npc',
      img: monsterImgUri,
      token: {
        ..._convertTokenSize(monster.size),
        img: monsterImgUri,
      },
      data: {
        cr: {
          value: _convertCr(vetoolsMonsterImportConfig, monster.cr),
        },
        race: {
          value: _toTitleCase(monster.type),
        },
        background: {
          value: _convertAlignment(monster.alignment),
        },
        features: {
          wounds: {
            value: monsterWounds,
            max: monsterWounds,
          },
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

    // Create the compendium documents
    let monsterDocument = await game.farhome.FarhomeActor.createDocuments([newMonsterDocument], {
      pack: worldCompendiumName,
    });

    console.log(monsterDocument);

    // #todo Add items
  }

  // Send the final progress completion state
  if (typeof progressCallback === 'function') {
    progressCallback(beastiaryJson.monster.length, beastiaryJson.monster.length);
  }

  // #todo If I can add a bunch of data to this on document creation, it will make it much more unit-testable if I have a parsing function that returns the data in a json layout, ready for document creation.
}

function _toTitleCase(str) {
  return String(str).replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function _getImageLink(veSource, veName) {
  const veSourceUriComponent = encodeURIComponent(veSource.replace('3pp', '(3pp)'));
  const veNameUriComponent = encodeURIComponent(veName);
  return `https://raw.githubusercontent.com/IncinX/5etools/master/img/${veSourceUriComponent}/${veNameUriComponent}.png`;
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

function _convertHp(vetoolsMonsterImportConfig, veHp) {
  return Math.ceil(veHp * vetoolsMonsterImportConfig.hpScale);
}

function _convertCr(vetoolsMonsterImportConfig, veCr) {
  const veAveragePartySize = 4.0;
  const veToFhMultiplier = 30.0 / 20.0; // Calculated based on max level differences
  const numericalVeCr = Function(`return ${veCr}`)();
  const farhomeCr =
    numericalVeCr < 1
      ? numericalVeCr
      : Math.floor(numericalVeCr * veToFhMultiplier * veAveragePartySize * vetoolsMonsterImportConfig.crScale);
  return farhomeCr;
}
