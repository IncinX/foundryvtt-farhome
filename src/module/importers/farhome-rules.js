import { markdown } from 'markdown';

export function parseRules(markdownString) {
  const markdownHtml = markdown.toHTML(markdownString);
  const markdownHtmlQuery = $(markdownHtml);

  // Parse non-background feats first
  // #todo These aren't working, figure out how to get it to find the #basic tag
  // #todo Add a check to only get #basic under a parent #feats tag
  // #todo This is definitely not working... it should also be more resilient so that Basic will go until it finds the next header of the same level
  const feats = markdownHtmlQuery
    .find('a[href$="Basic"]')
    //.nextUntil('a[href$="Journeyman"]')
    .map((_index, element) => {
      const level = 'Basic';
      const name = element.innerHTML;
      const description = element.nextSibling.innerHTML;

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
