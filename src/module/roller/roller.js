// #todo Add code documentation throughout roller.
// #todo Remove export if a function isn't used elsewhere
// #todo Remove unncecessary classes and functions
// #todo Decide if functions should be in or out of any classes
// #todo Remove async everywhere in this file that it is unnecessary, pay attention to returned promises too.

import { countMatches, combineAll, escapeHtml } from './roller-util';
import { DieRollView } from './roller-view';
import {
  Dice,
  DicePool,
  dieRollImages,
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
import { FHParser, parseFormula } from './roller-parser';
import { sendActorMessage } from '../core/chat';

/**
 * Establish hooks for the dice roller to interact with the chat.
 */
export function connectRoller() {
  // Register /fh message handler
  Hooks.on('init', () => {
    Hooks.on('chatMessage', _rollerChatMessageHandler);
  });

  // Handle re-roll button click
  Hooks.on('renderChatMessage', (_message, html, _data) => {
    html.on('click', `.fh-reroll`, _handleReroll);
  });
}

/**
 * Handles the /fh custom chat message command.
 * @param {ChatLog} _chatLog The ChatLog instance
 * @param {string} messageText The trimmed message content
 * @param {object} data Some basic chat data
 * @returns {Boolean} Whether the hook processor should continue.
 * @private
 */
function _rollerChatMessageHandler(_chatLog, messageText, _data) {
  if (messageText !== undefined) {
    if (game.farhome.roller.handlesCommand(messageText)) {
      game.farhome.roller.processRollCommand(messageText).then(sendChatRoll);
      return false;
    }
  }
  return true;
}

/**
 * Handle click message generated from the "Re-roll" button in chat.
 * @param {Event} event   The originating click event
 * @private
 */
async function _handleReroll(event) {
  event.preventDefault();

  // #todo It may be insufficient to just use button.parentElement.parentElement... I think I need to traverse up the DOM tree until I find the main content element
  // #todo This function can probably be cleaned up and stream-lined

  const button = event.target;
  const originalMessageElement = button.parentElement.parentElement;
  const messageElementClone = originalMessageElement.cloneNode(true);
  const messageQuery = $(messageElementClone);
  const rollElements = messageQuery.find('input');

  // Iterate through the inputs to find the dice to re-roll.
  let pendingRerollElements = [];

  rollElements.each((_index, element) => {
    if (element.checked) {
      element.disabled = true;
      pendingRerollElements.push(element);
    }
  });

  // Do the re-roll after the parsing so it doesn't interfere with the parsing.
  for (let pendingRerollElement of pendingRerollElements) {
    const rollData = _parseRoll(pendingRerollElement);
    const newRoll = game.farhome.roller.evaluateRerolls([], [rollData]);
    const rollHtml = await game.farhome.roller.formatRolls(newRoll, false);
    pendingRerollElement.insertAdjacentHTML('afterend', rollHtml);
  }

  // Need to re-compute the summary and re-post under the fh-roll-summary class
  const newRollSummaryData = _getRollSummaryData(messageQuery);
  const newRollSummary = await _getRollSummary(newRollSummaryData);
  let rollSummaryElement = $(messageQuery).find('.fh-roll-summary');
  rollSummaryElement.empty();
  rollSummaryElement.append(newRollSummary);

  sendActorMessage(messageQuery.html());
}

/**
 * Parse an HTML input element for it's current roll as a die and face.
 * @param {HTMLElement} input The HTMLElement input that contains the roll.
 * @returns {Roll} A roll object containing the die and face values.
 */
function _parseRoll(input) {
  const die = parseInt(input.dataset.die ?? '0', 10);
  const face = parseInt(input.dataset.face ?? '0', 10);
  return new Roll(die, face);
}

/**
 * Parses HTML containing roll elements to get a summary of successes, crits, wounds, etc.
 * @param {String} rollHtml HTML text containing roll elements.
 * @return {Object} Roll unmodified summary data containing successes, crits, wounds, hexes and poisons.
 */
export function _getRollSummaryData(rollHtml) {
  try {
    const fhRollQuery = $(rollHtml);

    let rolls = [];
    let containsRollData = false;

    fhRollQuery.find('input').each((_index, element) => {
      containsRollData = true;

      if (!element.disabled) {
        const rollData = _parseRoll(element);
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

    return rollModifiersData;
  } catch (_error) {
    // Do nothing since it is likely unparseable HTML which might happen in the case of error messages like
    // incorrect /fh chat commands.
    const rollModifiersData = {
      containsRollData: false,
    };
    return rollModifiersData;
  }
}

/**
 * Generates an HTML roll summary given the roll summary data.
 * @param {Object} rollSummaryData Roll summary data generated by {@link _getRollSummaryData}.
 * @returns {String} HTML string containing a formatted version of the summary data.
 */
export async function _getRollSummary(rollSummaryData) {
  const rollSummaryHtml = renderTemplate('systems/farhome/templates/chat/roll-summary.hbs', rollSummaryData);

  return rollSummaryHtml;
}

/**
 * Send the chat roll with the embedded roll html data, generate a summary and add appropriate buttons.
 * @param {String} evaluatedRollHtml HTML string containing the roll elements.
 * @param {String} activeEffectsHtml HTML string containing the effect elements like hex and poison.
 * @param {Object} manaData Object containing the required data to spend mana data.
 */
export async function sendChatRoll(evaluatedRollHtml, activeEffectsHtml = '', manaData = undefined) {
  // Evaluate the roll summary if it is present.
  const rollSummaryData = _getRollSummaryData(evaluatedRollHtml);
  const rollSummaryHtml = rollSummaryData.containsRollData ? await _getRollSummary(rollSummaryData) : undefined;

  // #todo Need to analyze the activeEffectsHtml roll summary data, combine it, etc.

  const messageHtmlString = await renderTemplate('systems/farhome/templates/chat/chat-roll.hbs', {
    evaluatedRollHtml: evaluatedRollHtml,
    activeEffectsHtml: activeEffectsHtml,
    rollSummaryHtml: rollSummaryHtml,
    manaData: manaData,
  });

  // Send the evaluatedTemplate to chat.
  sendActorMessage(messageHtmlString);
}

/**
 * Given a die and various die faces, roll it (and potentially explode)
 * @param {Number} times How many times a die should be rolled
 * @param {Number} die Enum value for the die to roll
 * @param {Object} faces The enum with all the die's faces
 * @param {Object} rng Rrandom number generator
 * @return an array with all rolled faces
 */
export function rollDie(times, die, faces, rng) {
  return Array.from({ length: times }, () => rng(faces.length))
    .map((randomNumber) => faces[randomNumber])
    .flatMap((face) => {
      const result = new Roll(die, face);
      return [result];
    });
}

/**
 * Combines evaluated roll values to a summed monoid.
 * @param {Array} rolls Array of rolls to combine.
 * @param {Function} rollToRollResult Function to convert rolls to a result monoid.
 * @param {Function} rollValuesMonoid Object with identity and combine functions to combine monoid's.
 * @return {Object} Monoid with the combined roll results.
 */
export function combineRolls(rolls, rollToRollResult, rollValuesMonoid) {
  const results = rolls.map((roll) => rollToRollResult(roll));
  return combineAll(results, rollValuesMonoid);
}

/**
 * Class representing a roll with a die and a face.
 */
export class Roll {
  /**
   * Constructs the roll object.
   * @param {Number} die Enum value for the die being represented.
   * @param {Number} face Enum value for the face being represented.
   */
  constructor(die, face) {
    this.die = die;
    this.face = face;
  }

  /**
   * Returns the roll as a string.
   * @return {String} String representation of the roll.
   * @override
   */
  toString() {
    return `die: ${this.die}, face: ${this.face}`;
  }
}

/**
 * Centralized roller class used throughout the farhome game.
 */
export class FHRoller {
  /**
   * Constructs the farhome class with a given random number generator.
   * @param {Object} rng Random number generator that can be customized for testing purposes.
   */
  constructor(rng) {
    this.command = 'fh';

    // #todo Parsers and canKeep are probably unnecessary now, remove.
    this.parsers = [new FHParser()];
    this.canKeep = true;

    this.rng = rng;
  }

  /**
   * Indicates whether a messages that is prefixed with a / can be parsed by this roller object.
   * @param {String} command Command to check for parsability.
   * @return {Boolean} True if the command can be parsed, false otherwise.
   */
  handlesCommand(command) {
    return command.startsWith(`/${this.command} `);
  }

  /**
   * Parses and executes a given roll command.
   * @param {String} command Command to check for parsability and execution.
   * @return {String} HTML string containing the roll results.
   */
  async processRollCommand(command) {
    // try to match "/{command} {formula} # {flavourText}" pattern
    const matches = command.match(new RegExp(`^/${this.command} (.*?)(?:\\s*#\\s*([^]+)?)?$`)) || [];
    return this.evaluateRollFormula(matches[1] || '', matches[2]);
  }

  /**
   * Evaluates a given roll formula (the roll formula is documented in roll-parser or shown with the '/fh help' command).
   * @param {String} formula Roll formula to evaluate.
   * @return {String} HTML string containing the roll results or an HTML error message if there was a failure to parse.
   */
  async evaluateRollFormula(formula) {
    try {
      const parsedFormula = parseFormula(formula, this.parsers);
      const rolls = this.evaluateRolls(parsedFormula);

      console.log(`Farhome | Rolled ${rolls} with formula ${parsedFormula}`);

      return this.formatRolls(rolls);
    } catch (e) {
      // The successful case returns a promise, so the error should be returned as a promise
      // to keep things simple for callers.
      return new Promise((resolve) => resolve(e.message));
    }
  }

  /**
   * Rolls the dice from a pool which is an object where each key represented a die and the value is the number of dice to roll.
   * @param {Object} pool Object containing the dice to roll.
   * @return {Array} Array of rolls as @see Roll objects.
   */
  evaluateRolls(pool) {
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

  /**
   * Creates a union of unrolled dice and dice to re-roll for new values.
   * @param {Array} keptResults Array of dice objects to keep and join to the final list.
   * @param {Array} rerollResults Array of dice objects to keep and join to the final list.
   * @return {Array} Array of rolls as @see Roll objects.
   */
  evaluateRerolls(keptResults, rerollResults) {
    const reRolledDice = rerollResults.map((roll) => roll.die);
    const pool = this.toDicePool(reRolledDice);
    const reRolls = this.evaluateRolls(pool);
    return [...keptResults, ...reRolls];
  }

  /**
   * Combines the rolls into a single monoid representig the sum of the die results.
   * @param {Array} rolls The rolls to combine.
   * @return {Object} Monoid representing the sum result of all the rolls.
   */
  combineRolls(rolls) {
    // #todo There are two combineRolls functions, here and global, fix that.
    const results = rolls.map((roll) => parseRollValues(roll));
    return combineAll(results, rollValuesMonoid);
  }

  /**
   * Formats the given rolls into an HTML representation.
   * @param {Array} rolls The rolls to format.
   * @return {Boolean} wrapDiv Whether to wrap the result in a div for proper formatting. If false, the rolls are represented only as HTML input tags.
   * @return {String} HTML string containing the roll results.
   */
  async formatRolls(rolls, wrapDiv = true) {
    const combinedRolls = combineRolls(rolls, parseRollValues, rollValuesMonoid);
    const rollHtml = await renderTemplate('systems/farhome/templates/chat/raw-rolls.hbs', {
      rolls: rolls.map((roll) => new DieRollView(roll, dieRollImages)),
      wrapDiv: wrapDiv,
    });

    return rollHtml;
  }

  /**
   * Converts a set of dice to a dice pool where the key represents the die name and the value indicates the number of those dice.
   * @param {Array} dice Array of dice objects to convert to a dice pool. The dice objects are represented as @see Roll objects.
   * @return {Object} Object representing the dice pool.
   */
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
