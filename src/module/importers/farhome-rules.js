import { markdown } from 'markdown';

export function parseRules(markdownString) {
  const markdownHtml = markdown.toHTML(markdownString);
  const markdownHtmlQuery = $(markdownHtml);

  // Parse non-background feats first
  // #todo These aren't working, figure out how to get it to find the #basic tag
  markdownHtmlQuery.find('a[href$="Basic"]').each((index, element) => {
    console.log(element.innerHTML);
  });

  // #todo Add background feats as distinct set of feats

  // #todo Parse maneuvers

  // #todo Parse all spells for each school of magic separately
}
