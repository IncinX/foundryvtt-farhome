import { evaluateTemplate } from './template-evaluator';

describe('Evaluate template', () => {
  it('[${value}] is 3', () => {
    expect(evaluateTemplate('[${value}]', { value: 3 })).toBe('3');
  });
});
