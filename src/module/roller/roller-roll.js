// #todo Add code documentation everywhere.

import Mustache from 'mustache';
import { countMatches, combineAll, escapeHtml } from './roller-util';
import { rollTemplate, baseTemplate } from './roller-templates';
import { DieRollView } from './roller-view';
import {
  Dice,
  DicePool,
  dieRollImages,
  interpretResult,
  parseRollValues,
  rollValuesMonoid,
  HERO_ROLL_TABLE,
  SUPERIOR_ROLL_TABLE,
  ENHANCED_ROLL_TABLE,
  NORMAL_ROLL_TABLE,
  BAD_ROLL_TABLE,
  TERRIBLE_ROLL_TABLE,
  SUPERIOR_DEFENSE_ROLL_TABLE,
  DEFENSE_ROLL_TABLE,
  WOUND_ROLL_TABLE,
  GUARANTEED_WOUND_ROLL_TABLE,
} from './roller-dice';
import { summaryTemplate } from './roller-templates';
import { FHParser, parseFormula } from './roller-parser';

/**
 * Given a die and various die faces, roll it (and potentially explode)
 * @param times how many times a die should be rolled
 * @param die enum value
 * @param faces the enum with all the die's faces
 * @param explodes a function that returns true if a dice explodes
 * @param rng random number generator
 * @return an array with all rolled faces
 */
export function rollDie(times, die, faces, rng, explodes = () => false) {
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

export function combineRolls(rolls, rollToRollResult, rollValuesMonoid) {
  const results = rolls.map((roll) => rollToRollResult(roll));
  return combineAll(results, rollValuesMonoid);
}

export class Roll {
  constructor(die, face, wasReRoll = false) {
    this.die = die;
    this.face = face;
    this.wasReRoll = wasReRoll;
  }

  toString() {
    return `die: ${this.die}, face: ${this.face}, wasReRoll: ${this.wasReRoll}`;
  }
}

export class ReRoll {
  constructor(roll, shouldReRoll) {
    this.roll = roll;
    this.shouldReRoll = shouldReRoll;
  }
}

export class Roller {
  constructor(command, parsers, canKeep) {
    this.command = command;
    // #todo Some of this stuff can be greatly simplified if I remove the generic aspect of it like propagating the parsers
    this.parsers = parsers;
    this.canKeep = canKeep;
  }

  handlesCommand(command) {
    return command.startsWith(`/${this.command} `);
  }

  rollCommand(command) {
    // try to match "/{command} {formula} # {flavourText}" pattern
    const matches = command.match(new RegExp(`^/${this.command} (.*?)(?:\\s*#\\s*([^]+)?)?$`)) || [];
    return this.rollFormula(matches[1] || '', matches[2]);
  }

  rollFormula(formula, flavorText, canReRoll = true, showInterpretation = true) {
    try {
      const parsedFormula = parseFormula(formula, this.parsers);
      const rolls = this.roll(parsedFormula);
      console.log(`Farhome | Rolled ${rolls} with formula ${parsedFormula}`);
      return this.formatRolls(rolls, flavorText, canReRoll, showInterpretation);
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
    const parsedRolls = keptRolls.map((roll) => this.toRoll(roll[0], roll[1]));
    return this.formatRolls(parsedRolls);
  }

  formatReRolls(rolls) {
    // #todo This method is a mess and should be re-worked.
    const reRolls = rolls.flatMap((reRoll) => {
      if (reRoll.shouldReRoll) {
        const pool = this.toDicePool([reRoll.roll.die]);
        return this.roll(pool).map((roll) => new ReRoll(roll, true));
      } else {
        return reRoll;
      }
    });
    return this.formatRolls(reRolls.map((reRoll) => reRoll.roll));
  }

  /**
   * Take the enum indices of a die and face and turn it into a roll
   * @param die
   * @param face
   */
  toRoll(die, face) {}

  /**
   * Roll a dice pool and return the result rolls
   * @param dicePool
   */
  roll(dicePool) {}

  /**
   * Return a template that displays and explains the roll
   * @param rolls
   * @param flavorText an option description of the roll
   */
  formatRolls(rolls, flavorText) {}

  /**
   * Create a dice pool from an array of different dice
   * @param dice
   */
  toDicePool(dice) {}
}

export class FHRoller extends Roller {
  constructor(rng, command) {
    super(command, [new FHParser()], false);

    this.rng = rng;
  }

  roll(pool) {
    return [
      ...rollDie(pool.hero, Dice.HERO, HERO_ROLL_TABLE, this.rng),
      ...rollDie(pool.superior, Dice.SUPERIOR, SUPERIOR_ROLL_TABLE, this.rng),
      ...rollDie(pool.enhanced, Dice.ENHANCED, ENHANCED_ROLL_TABLE, this.rng),
      ...rollDie(pool.normal, Dice.NORMAL, NORMAL_ROLL_TABLE, this.rng),
      ...rollDie(pool.bad, Dice.BAD, BAD_ROLL_TABLE, this.rng),
      ...rollDie(pool.terrible, Dice.TERRIBLE, TERRIBLE_ROLL_TABLE, this.rng),
      ...rollDie(pool.superiorDefense, Dice.SUPERIOR_DEFENSE, SUPERIOR_DEFENSE_ROLL_TABLE, this.rng),
      ...rollDie(pool.defense, Dice.DEFENSE, DEFENSE_ROLL_TABLE, this.rng),
      ...rollDie(pool.guaranteedWound, Dice.GUARANTEED_WOUND, GUARANTEED_WOUND_ROLL_TABLE, this.rng),
      ...rollDie(pool.wound, Dice.WOUND, WOUND_ROLL_TABLE, this.rng),
    ];
  }

  combineRolls(rolls) {
    const results = rolls.map((roll) => parseRollValues(roll));
    return combineAll(results, rollValuesMonoid);
  }

  toRoll(die, face) {
    return new Roll(die, face);
  }

  formatRoll(roll) {
    return Mustache.render(rollTemplate, {
      rolls: [new DieRollView(roll, dieRollImages)],
    });
  }

  formatRolls(rolls, flavorText, canReRoll = true, showInterpretation = true) {
    const combinedRolls = combineRolls(rolls, parseRollValues, rollValuesMonoid);
    return Mustache.render(
      baseTemplate,
      {
        canReRoll: canReRoll,
        showInterpretation: showInterpretation,
        flavorText,
        rolls: rolls.map((roll) => new DieRollView(roll, dieRollImages)),
        results: interpretResult(combinedRolls),
      },
      { interpretation: summaryTemplate },
    );
  }

  toDicePool(dice) {
    const hero = countMatches(dice, (die) => die === Dice.HERO);
    const superior = countMatches(dice, (die) => die === Dice.SUPERIOR);
    const enhanced = countMatches(dice, (die) => die === Dice.ENHANCED);
    const normal = countMatches(dice, (die) => die === Dice.NORMAL);
    const bad = countMatches(dice, (die) => die === Dice.BAD);
    const terrible = countMatches(dice, (die) => die === Dice.TERRIBLE);
    const superiorDefense = countMatches(dice, (die) => die === Dice.SUPERIOR_DEFENSE);
    const defense = countMatches(dice, (die) => die === Dice.DEFENSE);
    const guaranteedWound = countMatches(dice, (die) => die === Dice.GUARANTEED_WOUND);
    const wound = countMatches(dice, (die) => die === Dice.WOUND);
    return new DicePool(
      hero,
      superior,
      enhanced,
      normal,
      bad,
      terrible,
      superiorDefense,
      defense,
      guaranteedWound,
      wound,
    );
  }
}
