// #todo Add code documentation throughout roller.
// #todo Flatten FHRoller so it doens't inherit
// #todo Move system code in here, and add to the FHRoller object if it doesn't need to be just a regular function, consider making things static functions as well
// #todo Remove export if a function isn't used elsewhere
// #todo Rename file to just roller.js
// #todo Remove mustache dependency here and in roll-templates.js
// #todo Cleanup the import dependencies, avoid ciruclar dependencies

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

export function connectRoller() {
  // Register chat handlers
  Hooks.on('init', () => {
    Hooks.on('chatMessage', _diceRollerChatMessageHandler);
  });

  Hooks.on('renderChatLog', (_app, html, _data) => {
    html.on('click', '.fh-roller-reroll', _diceRollerButtonHandler);
  });
}

function _diceRollerChatMessageHandler(_chatLog, messageText, data) {
  if (messageText !== undefined) {
    if (game.farhome.roller.handlesCommand(messageText)) {
      data.content = game.farhome.roller.rollCommand(messageText);
      ChatMessage.create(data, {});
      return false;
    }
  }
  return true;
}

function _diceRollerButtonHandler(event) {
  event.preventDefault();

  const button = event.target;
  const form = button.parentElement;
  const rolls = Array.from(form.querySelectorAll('input'));
  const selectedRolls = rolls.filter((roll) => roll.checked);

  if (selectedRolls.length > 0) {
    const parsedRolls = rolls.map((rollInput) => {
      const roll = parseRoll(rollInput);
      return new ReRoll(roll, rollInput.checked);
    });
    const result = game.farhome.roller.formatReRolls(parsedRolls);
    _renderNewRoll(result);

    selectedRolls.forEach((elem) => (elem.checked = false));

    // #todo Need to add support to disable roll checkboxes and display the re-rolls here too... Create some helper functions here that can be re-used elsewhere.
  }
}

export function parseRoll(input) {
  const die = parseInt(input.dataset.die ?? '0', 10);
  const face = parseInt(input.dataset.face ?? '0', 10);
  return new Roll(die, face);
}

function _renderNewRoll(rolls) {
  const chatData = {
    user: game.user.id,
    content: rolls,
  };
  ChatMessage.create(chatData, { displaySheet: false });
}

export function getRollSummaryData(rollHtml) {
  const fhRollQuery = $(rollHtml);

  let rolls = [];
  let containsRollData = false;

  fhRollQuery.find('input').each((_index, element) => {
    containsRollData = true;

    if (!element.disabled) {
      const rollData = parseRoll(element);
      rolls.push(rollData);
    }
  });

  const initialRollSummaryData = game.farhome.roller.combineRolls(rolls);

  // Compute the roll modifiers
  let rollModifiersData = {
    containsRollData: containsRollData,
    successes: initialRollSummaryData.successes,
    crits: initialRollSummaryData.crits,
    wounds: initialRollSummaryData.wounds,
    hex: 0,
    poison: 0,
  };

  // #todo These hard-coded class strings should be communicated through const static exports (possibly from a class)

  fhRollQuery.find('.fh-successes').each((_index, element) => {
    rollModifiersData.successes += parseInt(element.dataset.successes);
  });

  fhRollQuery.find('.fh-crits').each((_index, element) => {
    rollModifiersData.crits += parseInt(element.dataset.crits);
  });

  fhRollQuery.find('.fh-wounds').each((_index, element) => {
    rollModifiersData.wounds += parseInt(element.dataset.wounds);
  });

  fhRollQuery.find('.fh-hex').each((_index, element) => {
    rollModifiersData.hex += parseInt(element.dataset.hex);
  });

  fhRollQuery.find('.fh-poison').each((_index, element) => {
    rollModifiersData.poison += parseInt(element.dataset.poison);
  });

  // #todo Do hex and poison later when active effects are in.
  // #todo Apply hex modifiers
  // #todo Roll and apply poison modifiers... Where to make those rolls? At the end?

  return rollModifiersData;
}

export function getRollSummary(rollSummaryData) {
  const rollSummaryContent = Mustache.render(summaryTemplate, {
    results: rollSummaryData,
  });
  return `<div class='fh-roll-summary'>${rollSummaryContent}</div>`;
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
