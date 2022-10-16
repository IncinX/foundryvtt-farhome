import { getSpellPowerToMaxManaTable, convertSpellLevelToManaCost } from './mana';

describe('Mana Table', () => {
  it('getSpellPowerToMaxManaTable()[x] = y', () => {
    expect(getSpellPowerToMaxManaTable()[7]).toBe(48);
    expect(getSpellPowerToMaxManaTable()[8]).toBe(60);
    expect(getSpellPowerToMaxManaTable()[30]).toBe(48 + (30 - 7) * 12);
  });
});

describe('Mana Cost', () => {
  it('convertSpellLevelToManaCost(x) = y', () => {
    expect(convertSpellLevelToManaCost(0)).toBe(0);
    expect(convertSpellLevelToManaCost(1)).toBe(1);
    expect(convertSpellLevelToManaCost(2)).toBe(2);
    expect(convertSpellLevelToManaCost(3)).toBe(3);
    expect(convertSpellLevelToManaCost(4)).toBe(4);
    expect(convertSpellLevelToManaCost(5)).toBe(6);
    expect(convertSpellLevelToManaCost(7)).toBe(10);
    expect(convertSpellLevelToManaCost(8)).toBe(13);
    expect(convertSpellLevelToManaCost(9)).toBe(16);
    expect(convertSpellLevelToManaCost(10)).toBe(20);
  });
});
