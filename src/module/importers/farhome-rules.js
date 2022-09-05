import { markdown } from 'markdown';

export function parseRules(markdownString) {
  const markdownHtml = markdown.toHTML(markdownString);
  const markdownHtmlQuery = $(markdownHtml);

  // Parse non-background feats first
  markdownHtmlQuery.find(':header').find('Feats').each((index, element) => {
    console.log(element);
  });

  // #todo Add background feats as distinct set of feats

  // #todo Parse maneuvers

  // #todo Parse all spells for each school of magic separately
}
