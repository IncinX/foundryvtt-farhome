import { shim } from 'array.prototype.flatmap';
import { combineAll, IMonoid, Predicate } from './lang';
import { IParser, parseFormula } from './parser';
import { RandomNumberGenerator } from './rng';
import { escapeHtml } from './util';

export class Roll {
  constructor(die, face, wasReRoll = false) {
  }

  toString() {
    return `die: ${this.die}, face: ${this.face}, wasReRoll: ${this.wasReRoll}`;
  }
}

export class ReRoll {
  constructor(indexedRoll, shouldReRoll) {
  }
}

export class Roller {
  constructor(command, parsers, canReRoll, canKeep) {
  }

  handlesCommand(command) {
    return command.startsWith(`/${this.command} `);
  }

  rollCommand(command) {
    // try to match "/{command} {formula} # {flavourText}" pattern
    const matches = command
      .match(new RegExp(`^/${this.command} (.*?)(?:\\s*#\\s*([^]+)?)?$`)) || [];
    return this.rollFormula(matches[1] || '', matches[2]);
  }

  rollFormula(formula, flavorText) {
    try {
      const parsedFormula = parseFormula(formula, this.parsers);
      const rolls = this.roll(parsedFormula);
      console.log(`Rolled ${rolls} with formula ${parsedFormula}`);
      return this.formatRolls(rolls, flavorText);
    } catch (e) {
      return escapeHtml(e.message);
    }
  }

  reRoll(keptResults, reRollResults) {
    const reRolledDice = reRollResults.map((roll) => roll.die);
    const pool = this.toDicePool(reRolledDice);
    const reRolls = this.roll(pool);
    return [...keptResults, ...reRolls];
  }

  formatKeptRolls(keptRolls) {
    const parsedRolls = keptRolls
      .map((roll) => this.toRoll(roll[0], roll[1]));
    return this.formatRolls(parsedRolls);
  }

  formatReRolls(rolls) {
    shim();
    const reRolls = rolls
      .flatMap((roll) => {
        const die = roll.indexedRoll[0];
        const face = roll.indexedRoll[1];
        const typedRoll = this.toRoll(die, face);
        if (roll.shouldReRoll) {
          const pool = this.toDicePool([typedRoll.die]);
          return this.roll(pool)
            .map((reRoll) => {
              reRoll.wasReRoll = true;
              return reRoll;
            });
        } else {
          return [typedRoll];
        }
      });
    return this.formatRolls(reRolls);
  }

  /**
   * Take the enum indices of a die and face and turn it into a roll
   * @param die
   * @param face
   */
  toRoll(die, face) { }

  /**
   * Roll a dice pool and return the result rolls
   * @param dicePool
   */
  roll(dicePool) { }

  /**
   * Return a template that displays and explains the roll
   * @param rolls
   * @param flavorText an option description of the roll
   */
  formatRolls(rolls, flavorText) { }

  /**
   * Create a dice pool from an array of different dice
   * @param dice
   */
  toDicePool(dice) { }

}

/**
 * Given a die and various die faces, roll it (and potentially explode)
 * @param times how many times a die should be rolled
 * @param die enum value
 * @param faces the enum with all the die's faces
 * @param explodes a function that returns true if a dice explodes
 * @param rng random number generator
 * @return an array with all rolled faces
 */
export function rollDie(times, die, faces, rng, explodes) {
  shim();
  return Array.from({ length: times }, () => rng(faces.length))
    .map((randomNumber) => faces[randomNumber])
    .flatMap((face) => {
      const result = new Roll(die, face);
      if (explodes(face)) {
        return [result, ...rollDie(1, die, faces, rng, explodes)];
      } else {
        return [result];
      }
    });
}

export function combineRolls(
  rolls,
  rollToRollResult,
  rollValuesMonoid,
) {
  const results = rolls
    .map((roll) => rollToRollResult(roll));
  return combineAll(results, rollValuesMonoid);
}
