import { markdown } from 'markdown';

export function parseRules(markdownString) {
  const markdownHTML = markdown.toHTML(markdownString);
  console.log(markdownHTML);
}
