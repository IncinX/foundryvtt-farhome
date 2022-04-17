import { getSpellPowerToManaTable } from './manaTable';

describe('Mana Table', () => {
  it('getSpellPowerToManaTable()[7] = 48', () => {
    expect(getSpellPowerToManaTable()[7]).toBe(48);
  });

  it('getSpellPowerToManaTable()[8] = 60', () => {
    expect(getSpellPowerToManaTable()[8]).toBe(60);
  });

  it('getSpellPowerToManaTable()[30] = 48 + (30-8) * 12', () => {
    expect(getSpellPowerToManaTable()[30]).toBe(48 + (30 - 7) * 12);
  });
});
