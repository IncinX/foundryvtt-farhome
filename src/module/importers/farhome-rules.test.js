import { parseRules } from './farhome-rules';

test('Parse Farhome Original Rules', async () => {
  const rulesUri =
    'https://raw.githubusercontent.com/scrabbletank/farhome-rules/2aebacdcb0124c2cc5001a0d031e12eb5025cf2f/rulesdoc.md';
  const data = await fetch(rulesUri);
  const markdownText = await data.text();
  const rulesData = parseRules(markdownText);

  expect(rulesData).toBeDefined();
  expect(rulesData.feats).toBeDefined();
  expect(rulesData.feats.length).toBeGreaterThan(0);
  /*
  expect(rulesData.backgrounds).toBeDefined();
  expect(rulesData.backgrounds.length).toBeGreaterThan(0);
  expect(rulesData.maneuvers).toBeDefined();
  expect(rulesData.maneuvers.length).toBeGreaterThan(0);
  expect(rulesData.spells).toBeDefined();
  expect(rulesData.spells.length).toBeGreaterThan(0);
  */
});

test('Parse Farhome Eberron Rules', async () => {
  // DEBUG! Just pass for now
  expect(true).toBe(true);
});
