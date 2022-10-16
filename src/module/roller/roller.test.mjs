// #todo Come up with more tests for functions in roller since it has changed a lot from when this was written

import { makeRng } from './roller-util';
import { Dice, DicePool, Faces } from './roller-dice';
import { Roll, FHRoller } from './roller';

// #todo Come up with a way to just roll all dice and test the distributions

test('should react to fh command', () => {
  const fhRoller = new FHRoller(makeRng(0));
  expect(fhRoller.handlesCommand('/fh ')).toBe(true);
});

test('should roll a hero success', () => {
  const fhRoller = new FHRoller(makeRng(0));
  const result = fhRoller.evaluateRolls(new DicePool(1, 0, 0, 0, 0, 0, 0, 0, 0, 0));

  expect(result.length).toBe(1);
  expect(result[0].die).toBe(Dice.HERO);
  expect(result[0].face).toBe(Faces.SUCCESS);
});

test('should roll one of each dice with rng 0', () => {
  const fhRoller = new FHRoller(makeRng(...Array(10).fill(0)));
  const result = fhRoller.evaluateRolls(new DicePool(...Array(10).fill(1)));

  expect(result.length).toBe(10);

  expect(result[0].die).toBe(Dice.HERO);
  expect(result[0].face).toBe(Faces.SUCCESS);

  expect(result[1].die).toBe(Dice.SUPERIOR);
  expect(result[1].face).toBe(Faces.BLANK);

  expect(result[2].die).toBe(Dice.ENHANCED);
  expect(result[2].face).toBe(Faces.BLANK);

  expect(result[3].die).toBe(Dice.NORMAL);
  expect(result[3].face).toBe(Faces.BLANK);

  expect(result[4].die).toBe(Dice.BAD);
  expect(result[4].face).toBe(Faces.CRITICAL_FAILURE);

  expect(result[5].die).toBe(Dice.TERRIBLE);
  expect(result[5].face).toBe(Faces.CRITICAL_FAILURE);

  expect(result[6].die).toBe(Dice.SUPERIOR_DEFENSE);
  expect(result[6].face).toBe(Faces.BLANK);

  expect(result[7].die).toBe(Dice.DEFENSE);
  expect(result[7].face).toBe(Faces.BLANK);

  expect(result[8].die).toBe(Dice.GUARANTEED_WOUND);
  expect(result[8].face).toBe(Faces.WOUND);

  expect(result[9].die).toBe(Dice.WOUND);
  expect(result[9].face).toBe(Faces.WOUND);
});

test('should roll one of each dice with rng 1', () => {
  const fhRoller = new FHRoller(makeRng(...Array(10).fill(1)));
  const result = fhRoller.evaluateRolls(new DicePool(...Array(10).fill(1)));

  expect(result.length).toBe(10);

  expect(result[0].die).toBe(Dice.HERO);
  expect(result[0].face).toBe(Faces.SUCCESS);

  expect(result[1].die).toBe(Dice.SUPERIOR);
  expect(result[1].face).toBe(Faces.SUCCESS);

  expect(result[2].die).toBe(Dice.ENHANCED);
  expect(result[2].face).toBe(Faces.BLANK);

  expect(result[3].die).toBe(Dice.NORMAL);
  expect(result[3].face).toBe(Faces.BLANK);

  expect(result[4].die).toBe(Dice.BAD);
  expect(result[4].face).toBe(Faces.FAILURE);

  expect(result[5].die).toBe(Dice.TERRIBLE);
  expect(result[5].face).toBe(Faces.DOUBLE_FAILURE);

  expect(result[6].die).toBe(Dice.SUPERIOR_DEFENSE);
  expect(result[6].face).toBe(Faces.BLANK);

  expect(result[7].die).toBe(Dice.DEFENSE);
  expect(result[7].face).toBe(Faces.BLANK);

  expect(result[8].die).toBe(Dice.GUARANTEED_WOUND);
  expect(result[8].face).toBe(Faces.WOUND);

  expect(result[9].die).toBe(Dice.WOUND);
  expect(result[9].face).toBe(Faces.WOUND);
});

test('should roll one of each dice with rng 2', () => {
  const fhRoller = new FHRoller(makeRng(...Array(10).fill(2)));
  const result = fhRoller.evaluateRolls(new DicePool(...Array(10).fill(1)));

  expect(result.length).toBe(10);

  expect(result[0].die).toBe(Dice.HERO);
  expect(result[0].face).toBe(Faces.DOUBLE_SUCCESS);

  expect(result[1].die).toBe(Dice.SUPERIOR);
  expect(result[1].face).toBe(Faces.SUCCESS);

  expect(result[2].die).toBe(Dice.ENHANCED);
  expect(result[2].face).toBe(Faces.SUCCESS);

  expect(result[3].die).toBe(Dice.NORMAL);
  expect(result[3].face).toBe(Faces.BLANK);

  expect(result[4].die).toBe(Dice.BAD);
  expect(result[4].face).toBe(Faces.FAILURE);

  expect(result[5].die).toBe(Dice.TERRIBLE);
  expect(result[5].face).toBe(Faces.FAILURE);

  expect(result[6].die).toBe(Dice.SUPERIOR_DEFENSE);
  expect(result[6].face).toBe(Faces.DEFENSE);

  expect(result[7].die).toBe(Dice.DEFENSE);
  expect(result[7].face).toBe(Faces.DEFENSE);

  expect(result[8].die).toBe(Dice.GUARANTEED_WOUND);
  expect(result[8].face).toBe(Faces.WOUND);

  expect(result[9].die).toBe(Dice.WOUND);
  expect(result[9].face).toBe(Faces.WOUND);
});

test('should roll one of each dice with rng 3', () => {
  const fhRoller = new FHRoller(makeRng(...Array(10).fill(3)));
  const result = fhRoller.evaluateRolls(new DicePool(...Array(10).fill(1)));

  expect(result.length).toBe(10);

  expect(result[0].die).toBe(Dice.HERO);
  expect(result[0].face).toBe(Faces.DOUBLE_SUCCESS);

  expect(result[1].die).toBe(Dice.SUPERIOR);
  expect(result[1].face).toBe(Faces.SUCCESS);

  expect(result[2].die).toBe(Dice.ENHANCED);
  expect(result[2].face).toBe(Faces.SUCCESS);

  expect(result[3].die).toBe(Dice.NORMAL);
  expect(result[3].face).toBe(Faces.BLANK);

  expect(result[4].die).toBe(Dice.BAD);
  expect(result[4].face).toBe(Faces.FAILURE);

  expect(result[5].die).toBe(Dice.TERRIBLE);
  expect(result[5].face).toBe(Faces.FAILURE);

  expect(result[6].die).toBe(Dice.SUPERIOR_DEFENSE);
  expect(result[6].face).toBe(Faces.DOUBLE_DEFENSE);

  expect(result[7].die).toBe(Dice.DEFENSE);
  expect(result[7].face).toBe(Faces.DEFENSE);

  expect(result[8].die).toBe(Dice.GUARANTEED_WOUND);
  expect(result[8].face).toBe(Faces.WOUND);

  expect(result[9].die).toBe(Dice.WOUND);
  expect(result[9].face).toBe(Faces.BLANK);
});

test('should roll one of each dice with rng 4', () => {
  const fhRoller = new FHRoller(makeRng(...Array(10).fill(4)));
  const result = fhRoller.evaluateRolls(new DicePool(...Array(10).fill(1)));

  expect(result.length).toBe(10);

  expect(result[0].die).toBe(Dice.HERO);
  expect(result[0].face).toBe(Faces.CRITICAL_SUCCESS);

  expect(result[1].die).toBe(Dice.SUPERIOR);
  expect(result[1].face).toBe(Faces.DOUBLE_SUCCESS);

  expect(result[2].die).toBe(Dice.ENHANCED);
  expect(result[2].face).toBe(Faces.SUCCESS);

  expect(result[3].die).toBe(Dice.NORMAL);
  expect(result[3].face).toBe(Faces.SUCCESS);

  expect(result[4].die).toBe(Dice.BAD);
  expect(result[4].face).toBe(Faces.BLANK);

  expect(result[5].die).toBe(Dice.TERRIBLE);
  expect(result[5].face).toBe(Faces.FAILURE);

  expect(result[6].die).toBe(Dice.SUPERIOR_DEFENSE);
  expect(result[6].face).toBe(Faces.CRITICAL_DEFENSE);

  expect(result[7].die).toBe(Dice.DEFENSE);
  expect(result[7].face).toBe(Faces.DEFENSE);

  expect(result[8].die).toBe(Dice.GUARANTEED_WOUND);
  expect(result[8].face).toBe(Faces.WOUND);

  expect(result[9].die).toBe(Dice.WOUND);
  expect(result[9].face).toBe(Faces.BLANK);
});

test('should roll one of each dice with rng 5', () => {
  const fhRoller = new FHRoller(makeRng(...Array(10).fill(5)));
  const result = fhRoller.evaluateRolls(new DicePool(...Array(10).fill(1)));

  expect(result.length).toBe(10);

  expect(result[0].die).toBe(Dice.HERO);
  expect(result[0].face).toBe(Faces.CRITICAL_SUCCESS);

  expect(result[1].die).toBe(Dice.SUPERIOR);
  expect(result[1].face).toBe(Faces.CRITICAL_SUCCESS);

  expect(result[2].die).toBe(Dice.ENHANCED);
  expect(result[2].face).toBe(Faces.CRITICAL_SUCCESS);

  expect(result[3].die).toBe(Dice.NORMAL);
  expect(result[3].face).toBe(Faces.SUCCESS);

  expect(result[4].die).toBe(Dice.BAD);
  expect(result[4].face).toBe(Faces.BLANK);

  expect(result[5].die).toBe(Dice.TERRIBLE);
  expect(result[5].face).toBe(Faces.BLANK);

  expect(result[6].die).toBe(Dice.SUPERIOR_DEFENSE);
  expect(result[6].face).toBe(Faces.CRITICAL_DEFENSE);

  expect(result[7].die).toBe(Dice.DEFENSE);
  expect(result[7].face).toBe(Faces.CRITICAL_DEFENSE);

  expect(result[8].die).toBe(Dice.GUARANTEED_WOUND);
  expect(result[8].face).toBe(Faces.WOUND);

  expect(result[9].die).toBe(Dice.WOUND);
  expect(result[9].face).toBe(Faces.BLANK);
});

test('it should re-roll a result', async () => {
  const keptDice = [new Roll(Dice.SUPERIOR, Faces.DOUBLE_SUCCESS)];
  const reRollDice = [new Roll(Dice.ENHANCED, Faces.BLANK)];
  const fhRoller = new FHRoller(makeRng(5), '');
  const result = await fhRoller.evaluateRerolls(keptDice, reRollDice);

  expect(result.length).toBe(2);
  expect(result[0].die).toBe(Dice.SUPERIOR);
  expect(result[0].face).toBe(Faces.DOUBLE_SUCCESS);
  expect(result[1].die).toBe(Dice.ENHANCED);
  expect(result[1].face).toBe(Faces.CRITICAL_SUCCESS);
});
