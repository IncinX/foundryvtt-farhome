export function createCompendiumFromRules(rulesUrl) {
  CompendiumCollection.createCompendium({
    name: 'feats-compendium',
    label: 'Feats Compendium',
    type: 'Item',
    system: 'farhome',
    package: 'system',
  });

  game.farhome.FarhomeItem.createDocuments(
    [
      {
        name: 'TestFeat',
        type: 'feat',
      },
    ],
    {
      pack: 'world.feats-compendium',
    },
  );
}

export function parseRules(markdownString) {
  const markdownHtml = require('markdown').markdown.toHTML(markdownString);
  const markdownHtmlQuery = $(markdownHtml);

  // Parse non-background feats first
  // #todo These aren't working, figure out how to get it to find the #basic tag
  // #todo Add a check to only get #basic under a parent #feats tag
  // #todo This is definitely not working... it should also be more resilient so that Basic will go until it finds the next header of the same level

  // DEBUG!
  markdownHtmlQuery
    .filter('a[href$="Basic"]')
    .siblings()
    .each((i, el) => {
      console.log(el.innerHTML);
    });

  const feats = markdownHtmlQuery
    .find('a[href$="Basic"]')
    //.filter('a[href$="Basic"]')
    .nextUntil('a[href$="Journeyman"]')
    .map((_index, element) => {
      const level = 'Basic';
      const name = element.innerHTML;
      const description = ''; //element.nextSibling.innerHTML;
      console.log(name);

      return { name, level, description };
    })
    .get();

  console.log(feats);

  // #todo Add background feats as distinct set of feats
  const backgrounds = [];

  // #todo Parse maneuvers
  const maneuvers = [];

  // #todo Parse all spells for each school of magic separately
  const spells = [];

  const rulesData = {
    feats,
    backgrounds,
    maneuvers,
    spells,
  };

  return rulesData;
}
