import { DicePool, dicePoolMonoid } from './roller-dice';
import { combineAll } from './roller-util';

export function parseFormula(formula, parsers) {
  const trimmedFormula = formula.replace(/\s+/g, '');
  const helpMessages = [];
  for (const parser of parsers) {
    if (parser.canParse(trimmedFormula)) {
      return parser.parse(trimmedFormula);
    } else {
      helpMessages.push(parser.help());
    }
  }
  const help = helpMessages.join('; ');
  throw new FormulaParseError(`Incorrect roll formula ${formula}! Usage: ${help}`);
}

export class FormulaParseError extends Error {
  constructor(msg) {
    super(msg);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export class FHParser {
  letters = '';
  numbers = new Set();

  constructor() {
    this.alphabet = 'hsenbt+Ddgw';
    this.formulaRegex = new RegExp(`^(?:(?:[0-9]*)?[${escapeRegExp(this.alphabet)}])+$`);
    this.rollValuesMonoid = dicePoolMonoid;
    this.letterExplanation = [
      'hero',
      'superior',
      'enhanced',
      'normal',
      'bad',
      'terrible',
      'superior defense',
      'superior defense',
      'defense',
      'guaranteed wound',
      'wound',
    ];

    this.letters = this.alphabet.split('');

    // Add the numbers 0-9 for multiplying dice
    for (let i = 0; i < 10; i++) {
      this.numbers.add(i.toString());
    }
  }

  letterToRolls(letter, occurrences) {
    if (letter === 'h') {
      return new DicePool(occurrences, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    } else if (letter === 's') {
      return new DicePool(0, occurrences, 0, 0, 0, 0, 0, 0, 0, 0);
    } else if (letter === 'e') {
      return new DicePool(0, 0, occurrences, 0, 0, 0, 0, 0, 0, 0);
    } else if (letter === 'n') {
      return new DicePool(0, 0, 0, occurrences, 0, 0, 0, 0, 0, 0);
    } else if (letter === 'b') {
      return new DicePool(0, 0, 0, 0, occurrences, 0, 0, 0, 0, 0);
    } else if (letter === 't') {
      return new DicePool(0, 0, 0, 0, 0, occurrences, 0, 0, 0, 0);
    } else if (letter === '+') {
      return new DicePool(0, 0, 0, 0, 0, 0, occurrences, 0, 0, 0);
    } else if (letter === 'D') {
      return new DicePool(0, 0, 0, 0, 0, 0, occurrences, 0, 0, 0);
    } else if (letter === 'd') {
      return new DicePool(0, 0, 0, 0, 0, 0, 0, occurrences, 0, 0);
    } else if (letter === 'g') {
      return new DicePool(0, 0, 0, 0, 0, 0, 0, 0, occurrences, 0);
    } else if (letter === 'w') {
      return new DicePool(0, 0, 0, 0, 0, 0, 0, 0, 0, occurrences);
    } else {
      throw new Error(`Unknown letter ${letter}`);
    }
  }

  canParse(formula) {
    return this.formulaRegex.test(formula);
  }

  parse(formula) {
    const letters = formula.split('');
    const rolls = [];
    let modifier = '';
    for (const letter of letters) {
      if (this.numbers.has(letter)) {
        modifier += letter;
      } else {
        if (modifier.length > 0) {
          const multiplier = parseInt(modifier, 10);
          rolls.push(this.letterToRolls(letter, multiplier));
          modifier = '';
        } else {
          rolls.push(this.letterToRolls(letter, 1));
        }
      }
    }
    return combineAll(rolls, this.rollValuesMonoid);
  }

  help() {
    const mappings = this.letterExplanation
      .map((explanation, index) => `${this.letters[index]} = ${explanation}`)
      .join(', ');
    return `Any combination of the following letters: ${this.letters.join(
      ', ',
    )} (${mappings}). To roll multiple dice simply add multiple letters or prepend a number, e.g.: c3ba`;
  }
}
