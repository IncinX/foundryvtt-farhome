import { evaluateTemplate } from './template-evaluator';

describe('Evaluate template', () => {
  let sampleData = {
    attributes: {
      dex: {
        value: 3
      }
    }
  };

  // TODO Currently skipped because the functionality is WIP, update the test and remove the skip later.
  it.skip('[${value}] is 3', () => {
    expect(evaluateTemplate('[${dex}]', sampleData)).toBe('3');
  });
});
