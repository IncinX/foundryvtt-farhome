// TODO This currently doesn't work due to the import

import { proficiencyRollFormula } from './roll';

describe('Proficiency Roll Formula', () => {
  it('(0, 1) will be "1e4n"', () => {
    expect(proficiencyRollFormula(0, 1)).toBe('1e4n');
  });

  it('(1, 1) will be "1s4n"', () => {
    expect(proficiencyRollFormula(1, 1)).toBe('1s4n');
  });

  it('(0, 5) will be "5e"', () => {
    expect(proficiencyRollFormula(0, 5)).toBe('5e');
  });
  
  it('(5, 0) will be "5n"', () => {
    expect(proficiencyRollFormula(5, 0)).toBe('5n');
  });
  
  it('(5, 5) will be "5s"', () => {
    expect(proficiencyRollFormula(5, 5)).toBe('5s');
  });
  
  it('(3, 5) will be "3s2e"', () => {
    expect(proficiencyRollFormula(3, 5)).toBe('3s2e');
  });
  
  it('(0, 6) will be "5e1n"', () => {
    expect(proficiencyRollFormula(0, 6)).toBe('5e1n');
  });
  
  it('(3, 6) will be "3s2e1n"', () => {
    expect(proficiencyRollFormula(3, 6)).toBe('3s2e1n');
  });
  
  it('(6, 6) will be "5s1e"', () => {
    expect(proficiencyRollFormula(6, 6)).toBe('5s1e');
  });
});