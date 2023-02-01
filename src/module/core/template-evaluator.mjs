import { proficiencyRollFormula, proficiencyRoll } from './roll';

/* -------------------------------------------- */
/*  Template evaluation functions               */
/* -------------------------------------------- */

/**
 * Evaluates an HTML string with embedded tempalte expressions denoted by [[templateExpression]].
 * @param {String} templateString A string containing HTML with embedded template expressions.
 * @param {Object} actorContext Reference to a FarhomeActor embedded data object.
 * @param {Object} itemContext Reference to a FarhomeItem embedded data object.
 * @param {Object} promptContext Reference to an object with user supplied prompt variables.
 * @returns String of HTML with the template expressions evaluates from the original templateString.
 */
export async function evaluateTemplate(templateString, actorContext, itemContext, promptContext = {}) {
  let evaluatedString = templateString;

  // Get a list of matches
  let pattern = /\[\[(.*?)\]\]/g;
  let templateChunks = templateString.match(pattern);

  if (templateChunks !== null) {
    // Iterate through the chunks and swap in the replacements
    for (const templateChunk of templateChunks) {
      // Strip the first two and last two characters (which represent [[]] based on the regular expression.)
      let strippedRollChunk = templateChunk.substring(2, templateChunk.length - 2);

      let rollChunkReplacement = await evaluateTemplateChunk(
        strippedRollChunk,
        actorContext,
        itemContext,
        promptContext,
      );

      evaluatedString = evaluatedString.replace(templateChunk, rollChunkReplacement);
    }
  }

  // #todo Due to the nature of paragraphs in HTML and how the WYSIWYG formats, there is a possibility for nested paragraphs.
  //       Browsers will terminate those as empty paragraphs, so we should remove them here.
  //       Additionally, we should remove paragraphs before div's, as they seem to be terminated by browsers as well.
  //       For now, the workaround is to just hide them with css which isn't ideal.

  return evaluatedString;
}

/**
 * Evaluates the template expression and returns the replacement string. The template expression is a small javascript expression.
 * @param {String} templateChunk Embedded template expression that should be evaluated as a javascript function.
 * @param {Object} actorContext Reference to a FarhomeActor embedded data object.
 * @param {Object} itemContext Reference to a FarhomeItem embedded data object.
 * @returns String of HTML with the evaluated template expression.
 */
export async function evaluateTemplateChunk(templateChunk, actorContext, itemContext, promptContext) {
  // #todo This should be made into an object that pre-evaluates the help text and system function binds, etc.

  let evaluatorSystemContext = {
    targetCount: game.user.targets.size,
  };

  // #todo Try to automate this with some loops but still keep the concise syntax?
  let evaluatorActorContext = actorContext
    ? {
        name: actorContext.name,

        str: actorContext.system.attributes.str.value,
        dex: actorContext.system.attributes.dex.value,
        sta: actorContext.system.attributes.sta.value,
        int: actorContext.system.attributes.int.value,
        will: actorContext.system.attributes.will.value,
        cha: actorContext.system.attributes.cha.value,

        maxOneTwoHand: Math.max(
          actorContext.system.proficiencies.weapons.oneHand.value,
          actorContext.system.proficiencies.weapons.twoHand.value,
        ),
        maxStrDex: Math.max(actorContext.system.attributes.str.value, actorContext.system.attributes.dex.value),

        strSave: actorContext.system.proficiencies.saves.str.value,
        dexSave: actorContext.system.proficiencies.saves.dex.value,
        staSave: actorContext.system.proficiencies.saves.sta.value,
        intSave: actorContext.system.proficiencies.saves.int.value,
        willSave: actorContext.system.proficiencies.saves.will.value,
        chaSave: actorContext.system.proficiencies.saves.cha.value,

        athletics: actorContext.system.proficiencies.attributes.str.athletics.value,
        intimidation: actorContext.system.proficiencies.attributes.str.intimidation.value,

        acrobatics: actorContext.system.proficiencies.attributes.dex.acrobatics.value,
        lockpicking: actorContext.system.proficiencies.attributes.dex.lockpicking.value,
        stealth: actorContext.system.proficiencies.attributes.dex.stealth.value,
        sleightOfHand: actorContext.system.proficiencies.attributes.dex.sleightOfHand.value,

        exhaustion: actorContext.system.proficiencies.attributes.sta.exhaustion.value,
        survival: actorContext.system.proficiencies.attributes.sta.survival.value,

        arcana: actorContext.system.proficiencies.attributes.int.arcana.value,
        investigation: actorContext.system.proficiencies.attributes.int.investigation.value,
        lore: actorContext.system.proficiencies.attributes.int.lore.value,
        medicine: actorContext.system.proficiencies.attributes.int.medicine.value,

        animalHandling: actorContext.system.proficiencies.attributes.will.animalHandling.value,
        insight: actorContext.system.proficiencies.attributes.will.insight.value,
        nature: actorContext.system.proficiencies.attributes.will.nature.value,
        perception: actorContext.system.proficiencies.attributes.will.perception.value,

        conversation: actorContext.system.proficiencies.attributes.cha.conversation.value,
        diplomacy: actorContext.system.proficiencies.attributes.cha.diplomacy.value,
        performance: actorContext.system.proficiencies.attributes.cha.performance.value,
        religion: actorContext.system.proficiencies.attributes.cha.religion.value,

        oneHand: actorContext.system.proficiencies.weapons.oneHand.value,
        twoHand: actorContext.system.proficiencies.weapons.twoHand.value,
        ranged: actorContext.system.proficiencies.weapons.ranged.value,
        unarmed: actorContext.system.proficiencies.weapons.unarmed.value,

        arcane: actorContext.system.proficiencies.spells.arcane.value,
        divine: actorContext.system.proficiencies.spells.divine.value,
        druidic: actorContext.system.proficiencies.spells.druidic.value,
        elder: actorContext.system.proficiencies.spells.elder.value,
        occult: actorContext.system.proficiencies.spells.occult.value,

        repairKit: actorContext.system.proficiencies.tools.repairKit.value,
        enchantersTools: actorContext.system.proficiencies.tools.enchantersTools.value,
        apothecarySet: actorContext.system.proficiencies.tools.apothecarySet.value,
        scribingTools: actorContext.system.proficiencies.tools.scribingTools.value,
      }
    : {};

  // #todo A helper function could make a lot of this simpler
  let evaluatorItemContext = {
    name: itemContext.name,
    description: itemContext.system.description.value,
    rarity: itemContext.system.rarity ? game.i18n.localize(`farhome.${itemContext.system.rarity.value}`) : '',
    apCost: itemContext.system.apCost ? itemContext.system.apCost.value : '',
    range: itemContext.system.range ? itemContext.system.range.value : '',
    damageType: itemContext.system.damageType
      ? game.i18n.localize(`farhome.${itemContext.system.damageType.value}`)
      : '',
    charges: itemContext.system.charges ? itemContext.system.charges.value : '',
    quantity: itemContext.system.quantity ? itemContext.system.quantity.value : '',
    weight: itemContext.system.weight ? itemContext.system.weight : '',
    weaponType: itemContext.system.weaponType
      ? game.i18n.localize(`farhome.${itemContext.system.weaponType.value}`)
      : '',
    armorBonus: itemContext.system.armorBonus ? itemContext.system.armorBonus.value : '',
    armorPenalty: itemContext.system.armorPenalty ? itemContext.system.armorPenalty.value : '',
    armorType: itemContext.system.armorType ? game.i18n.localize(`farhome.${itemContext.system.armorType.value}`) : '',
    levelRequirements: itemContext.system.levelRequirements ? itemContext.system.levelRequirements.value : '',
    apCosts: itemContext.system.apCosts ? itemContext.system.apCosts.value : '',
    spellLevel: itemContext.system.spellLevel ? itemContext.system.spellLevel.value : '',
    spellSchool: itemContext.system.spellSchool
      ? game.i18n.localize(`farhome.${itemContext.system.spellSchool.value}`)
      : '',
    spellDuration: itemContext.system.duration ? itemContext.system.duration.value : '',
    castingTime: itemContext.system.castingTime ? itemContext.system.castingTime.value : '',
    areaOfEffect: itemContext.system.areaOfEffect
      ? game.i18n.localize(`farhome.${itemContext.system.areaOfEffect.value}`)
      : '',

    // These items are derived or queried from the user
    castedSpellLevel: itemContext.castedSpellLevel ?? '',
    spellLevelDifference: itemContext.spellLevelDifference ?? '',
  };

  // Build the help text
  // #todo- A lot of this should really be localized, but it's not that important for now
  let help = '<b>global context:</b><br/>';
  help += '<ul>';
  help += '<li>fh(formulaString) -- Performs a roll given the formula.</li><br/>';
  help +=
    '<li>skill(proficiency, attribute) -- Performs a skill roll with the given proficiency and attribute.</li><br/>';
  help +=
    '<li>formula(proficiency, attribute) -- Gets the roll formula with the given proficiency and attribute.</li><br/>';
  help += '<li>s -- System helper function context (see below).</li><br/>';
  help += '<li>a -- Actor data context (see below).</li><br/>';
  help += '<li>i -- Item data context (see below).</li><br/>';
  help += '<li>p -- Prompt data context (see below).</li><br/>';

  help += '</ul>';

  help += '<b>s (system context):</b><br/>';
  help += '<ul>';
  help += '<li>targetCount -- Returns the number of targets selected in game.</li><br/>';
  help += '</ul>';

  help += '<b>a (actor context):</b><br/>';
  help += '<ul>';
  for (const [key, value] of Object.entries(evaluatorActorContext)) {
    help += `<li>${key}</li><br/>`;
  }
  help += '</ul>';

  help += '<b>i (item context):</b><br/>';
  help += '<ul>';
  for (const [key, value] of Object.entries(evaluatorItemContext)) {
    help += `<li>${key}</li><br/>`;
  }
  help += '</ul>';

  // #todo This is pretty repetitive with the above and could use a helper function.
  help += '<b>p (prompt context):</b><br/>';
  help += '<ul>';
  for (const [key, value] of Object.entries(promptContext)) {
    help += `<li>${key}</li><br/>`;
  }
  help += '</ul>';

  // Evaluate the template chunk
  // #todo Technically the template code must call await for some of these functions, but it is working without that today
  //       Is that okay?
  const functionVariables = {
    fh: fh.bind(game.farhome.roller),
    skill: skill.bind(game.farhome.roller),
    formula: formula,
    success: success,
    crit: crit,
    wound: wound,
    s: evaluatorSystemContext,
    a: evaluatorActorContext,
    i: evaluatorItemContext,
    p: promptContext,
    help: help,
  };

  const evaluationFunction = Function(...Object.keys(functionVariables), 'return ' + templateChunk + ';');
  const evaluatedOutput = await evaluationFunction(...Object.values(functionVariables));

  return evaluatedOutput;
}

/* -------------------------------------------- */
/*  Template helper functions                   */
/* -------------------------------------------- */

/**
 * Evaluates a farhome formula string to an HTML roll and is provided as a helper function to the template evaluator.
 * This function requires binding to a FHRoller object.
 * @param {string} formula Farhome roll formula which has characters that represent dice to roll. Type '/fh x' in game to see the help text for more information.
 * @returns HTML containing the roll result.
 */
async function fh(formula) {
  // #todo I think this needs to be async, this may cause a problem... Set all this stuff to async too
  return await this.evaluateRollFormula(formula, '', false, false);
}

/**
 * Evaluates a farhome skill to an HTML roll and is provided as a helper function to the template evaluator.
 * This function requires binding to a FHRoller object.
 * @param {number} proficiency Proficiency value to use for the roll.
 * @param {number} attribute Attribute value to use for the roll.
 * @returns HTML containing the roll result.
 */
async function skill(proficiency, attribute) {
  return await proficiencyRoll(fh.bind(this), proficiency, attribute);
}

/**
 * Evaluates a farhome skill to a farhome roll formula and is provided as a helper function to the template evaluator.
 * @param {number} proficiency Proficiency value to use for the roll.
 * @param {number} attribute Attribute value to use for the roll.
 * @returns Farhome roll formula that can be used for generating rolls.
 */
function formula(proficiency, attribute) {
  return proficiencyRollFormula(proficiency, attribute);
}

/**
 * Creates an embedded HTML string to indicate a given number of successes.
 * @param {number} successCount The number of succeses to embed.
 * @returns Embedded HTML string with the given number of successes.
 */
function success(successCount) {
  return `<div class='fh-successes' data-successes='${successCount}'></div>`;
}

/**
 * Creates an embedded HTML string to indicate a given number of crits.
 * @param {number} critCount The number of crits to embed.
 * @returns Embedded HTML string with the given number of crits.
 */
function crit(critCount) {
  return `<div class='fh-crits' data-crits='${critCount}'></div>`;
}

/**
 * Creates an embedded HTML string to indicate a given number of wounds.
 * @param {number} woundCount The number of wounds to embed.
 * @returns Embedded HTML string with the given number of wounds.
 */
function wound(woundCount) {
  return `<div class='fh-wounds' data-wounds='${woundCount}'></div>`;
}
