import { proficiencyRollFormula, proficiencyRoll } from './roll';

/* -------------------------------------------- */
/*  Template evaluation functions               */
/* -------------------------------------------- */

export function evaluateTemplate(templateString, actorContext, itemContext) {
  let evaluatedString = templateString;

  // Get a list of matches
  let pattern = /\[\[(.*?)\]\]/g;
  let templateChunks = templateString.match(pattern);

  if (templateChunks !== null) {
    // Iterate through the chunks and swap in the replacements
    for (const templateChunk of templateChunks) {
      // Strip the first two and last two characters (which represent [[]] based on the regular expression.)
      let strippedRollChunk = templateChunk.substring(2, templateChunk.length - 2);

      let rollChunkReplacement = evaluateTemplateChunk(strippedRollChunk, actorContext, itemContext);

      evaluatedString = evaluatedString.replace(templateChunk, rollChunkReplacement);
    }
  }

  return evaluatedString;
}

export function evaluateTemplateChunk(templateChunk, actorContext, itemContext) {
  // #todo This should be made into an object that pre-evaluates the help text and system function binds, etc.

  let evaluatorSystemContext = {
    targetCount: game.user.targets.size,
  };

  // #todo Try to automate this with some loops but still keep the concise syntax?
  let evaluatorActorContext = actorContext
    ? {
        name: actorContext.name,

        str: actorContext.data.attributes.str.value,
        dex: actorContext.data.attributes.dex.value,
        sta: actorContext.data.attributes.sta.value,
        int: actorContext.data.attributes.int.value,
        will: actorContext.data.attributes.will.value,
        cha: actorContext.data.attributes.cha.value,

        maxOneTwoHand: Math.max(
          actorContext.data.proficiencies.weapons.oneHand.value,
          actorContext.data.proficiencies.weapons.twoHand.value,
        ),
        maxStrDex: Math.max(actorContext.data.attributes.str.value, actorContext.data.attributes.dex.value),

        strSave: actorContext.data.proficiencies.saves.str.value,
        dexSave: actorContext.data.proficiencies.saves.dex.value,
        staSave: actorContext.data.proficiencies.saves.sta.value,
        intSave: actorContext.data.proficiencies.saves.int.value,
        willSave: actorContext.data.proficiencies.saves.will.value,
        chaSave: actorContext.data.proficiencies.saves.cha.value,

        athletics: actorContext.data.proficiencies.attributes.str.athletics.value,
        intimidation: actorContext.data.proficiencies.attributes.str.intimidation.value,

        acrobatics: actorContext.data.proficiencies.attributes.dex.acrobatics.value,
        lockpicking: actorContext.data.proficiencies.attributes.dex.lockpicking.value,
        stealth: actorContext.data.proficiencies.attributes.dex.stealth.value,
        sleightOfHand: actorContext.data.proficiencies.attributes.dex.sleightOfHand.value,

        exhaustion: actorContext.data.proficiencies.attributes.sta.exhaustion.value,
        survival: actorContext.data.proficiencies.attributes.sta.survival.value,

        arcana: actorContext.data.proficiencies.attributes.int.arcana.value,
        investigation: actorContext.data.proficiencies.attributes.int.investigation.value,
        lore: actorContext.data.proficiencies.attributes.int.lore.value,
        medicine: actorContext.data.proficiencies.attributes.int.medicine.value,

        animalHandling: actorContext.data.proficiencies.attributes.will.animalHandling.value,
        insight: actorContext.data.proficiencies.attributes.will.insight.value,
        nature: actorContext.data.proficiencies.attributes.will.nature.value,
        perception: actorContext.data.proficiencies.attributes.will.perception.value,

        conversation: actorContext.data.proficiencies.attributes.cha.conversation.value,
        diplomacy: actorContext.data.proficiencies.attributes.cha.diplomacy.value,
        performance: actorContext.data.proficiencies.attributes.cha.performance.value,
        religion: actorContext.data.proficiencies.attributes.cha.religion.value,

        oneHand: actorContext.data.proficiencies.weapons.oneHand.value,
        twoHand: actorContext.data.proficiencies.weapons.twoHand.value,
        ranged: actorContext.data.proficiencies.weapons.ranged.value,
        unarmed: actorContext.data.proficiencies.weapons.unarmed.value,

        arcane: actorContext.data.proficiencies.spells.arcane.value,
        divine: actorContext.data.proficiencies.spells.divine.value,
        druidic: actorContext.data.proficiencies.spells.druidic.value,
        elder: actorContext.data.proficiencies.spells.elder.value,
        occult: actorContext.data.proficiencies.spells.occult.value,

        repairKit: actorContext.data.proficiencies.tools.repairKit.value,
        enchantersTools: actorContext.data.proficiencies.tools.enchantersTools.value,
        apothecarySet: actorContext.data.proficiencies.tools.apothecarySet.value,
        scribingTools: actorContext.data.proficiencies.tools.scribingTools.value,
      }
    : {};

  // #todo A helper function could make a lot of this simpler
  let evaluatorItemContext = {
    name: itemContext.name,
    description: itemContext.data.description.value,
    rarity: itemContext.data.rarity ? game.i18n.localize(`farhome.${itemContext.data.rarity.value}`) : '',
    apCost: itemContext.data.apCost ? itemContext.data.apCost.value : '',
    range: itemContext.data.range ? itemContext.data.range.value : '',
    damageType: itemContext.data.damageType ? game.i18n.localize(`farhome.${itemContext.data.damageType.value}`) : '',
    quantity: itemContext.data.quantity ? itemContext.data.quantity.value : '',
    weight: itemContext.data.weight ? itemContext.data.weight : '',
    weaponType: itemContext.data.weaponType ? game.i18n.localize(`farhome.${itemContext.data.weaponType.value}`) : '',
    armorBonus: itemContext.data.armorBonus ? itemContext.data.armorBonus.value : '',
    armorPenalty: itemContext.data.armorPenalty ? itemContext.data.armorPenalty.value : '',
    armorType: itemContext.data.armorType ? game.i18n.localize(`farhome.${itemContext.data.armorType.value}`) : '',
    levelRequirements: itemContext.data.levelRequirements ? itemContext.data.levelRequirements.value : '',
    apCosts: itemContext.data.apCosts ? itemContext.data.apCosts.value : '',
    spellLevel: itemContext.data.spellLevel ? itemContext.data.spellLevel.value : '',
    spellSchool: itemContext.data.spellSchool
      ? game.i18n.localize(`farhome.${itemContext.data.spellSchool.value}`)
      : '',
    spellDuration: itemContext.data.duration ? itemContext.data.duration.value : '',
    castingTime: itemContext.data.castingTime ? itemContext.data.castingTime.value : '',
    areaOfEffect: itemContext.data.areaOfEffect
      ? game.i18n.localize(`farhome.${itemContext.data.areaOfEffect.value}`)
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

  // Evaluate the template chunk
  let evaluationFunction = Function(
    'fh',
    'skill',
    'formula',
    'success',
    'crit',
    'wound',
    'hex',
    'poison',
    's',
    'a',
    'i',
    'help',
    'return ' + templateChunk + ';',
  );
  let evaluatedOutput = evaluationFunction(
    fh.bind(game.farhome.roller),
    skill.bind(game.farhome.roller),
    formula,
    success,
    crit,
    wound,
    hex,
    poison,
    evaluatorSystemContext,
    evaluatorActorContext,
    evaluatorItemContext,
    help,
  );

  return evaluatedOutput;
}

/* -------------------------------------------- */
/*  Template helper functions                   */
/* -------------------------------------------- */

// #todo Need to bind the farhome roller state object here
function fh(formula) {
  return this.rollFormula(formula, '', false, false);
}

function skill(proficiency, attribute) {
  return proficiencyRoll(fh.bind(this), proficiency, attribute);
}

function formula(proficiency, attribute) {
  return proficiencyRollFormula(proficiency, attribute);
}

function success(successCount) {
  return `<div class='fh-successes' data-successes='${successCount}'></div>`;
}

function crit(critCount) {
  return `<div class='fh-crits' data-crits='${critCount}'></div>`;
}

function wound(woundCount) {
  return `<div class='fh-wounds' data-wounds='${woundCount}'></div>`;
}

// #todo Perhaps disallow hex and poison later
function hex(hexCount) {
  return `<div class='fh-hex' data-hex='${hexCount}'></div>`;
}

function poison(poisonCount) {
  return `<div class='fh-poison' data-poison='${poisonCount}'></div>`;
}
