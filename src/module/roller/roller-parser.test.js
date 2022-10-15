import { parseFormula, FHParser } from './roller-parser';

const parsers = [new FHParser()];

test('it should fail to parse a roll formula', () => {
  const msg =
    '<p>Incorrect roll formula 1dx + 4ds!</p><p>Usage: Any combination of the following letters: ' +
    'h, s, e, n, b, t, +, D, d, g, w (h = hero, s = superior, e = enhanced, n = normal, b = bad, t = terrible, + = superior defense, D = superior defense, d = defense, g = guaranteed wound, w = wound). To roll multiple dice simply add multiple letters or prepend a number, e.g.: c3ba</p>';
  expect(() => parseFormula('1dx + 4ds', parsers)).toThrow(msg);
});

test('it should parse a simple farhome roll formula with each die', () => {
  const result = parseFormula('hsenbt+Ddgw', parsers);
  expect(result.hero).toBe(1);
  expect(result.superior).toBe(1);
  expect(result.enhanced).toBe(1);
  expect(result.normal).toBe(1);
  expect(result.bad).toBe(1);
  expect(result.terrible).toBe(1);
  expect(result.superiorDefense).toBe(2);
  expect(result.defense).toBe(1);
  expect(result.guaranteedWound).toBe(1);
  expect(result.wound).toBe(1);
});

test('it should parse a farhome with repetition roll formula', () => {
  const result = parseFormula('sssen', parsers);
  expect(result.superior).toBe(3);
  expect(result.enhanced).toBe(1);
  expect(result.normal).toBe(1);
});

test('it should parse a farhome with numbers roll formula', () => {
  const result = parseFormula('3s2e4w', parsers);
  expect(result.superior).toBe(3);
  expect(result.enhanced).toBe(2);
  expect(result.wound).toBe(4);
});
