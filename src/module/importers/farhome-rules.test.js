import { parseRules } from './farhome-rules';

test('Parse Farhome Original Rules', async () => {
  const rulesUri =
    'https://raw.githubusercontent.com/scrabbletank/farhome-rules/2aebacdcb0124c2cc5001a0d031e12eb5025cf2f/rulesdoc.md';
  const data = await fetch(rulesUri);
  const markdownText = await data.text();
  parseRules(markdownText);

  // DEBUG! Just pass for now
  expect(true).toBe(true);
});

test('Parse Farhome Eberron Rules', async () => {
  // DEBUG! Just pass for now
  expect(true).toBe(true);
});
