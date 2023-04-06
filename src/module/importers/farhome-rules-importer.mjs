import { marked } from 'marked';

const maxHeadingLevel = 6;

/**
 * Creates new compendiums based on input Farhome rulesets.
 * @param {Map<String, String>} compendiumLabels Map to translate compendium names to labels. Expected keys: "feats", "backgrounds", "conditions", "maneuvers", "spells"
 * @param {string} rulesUrl String to the URL containing the raw markdown for the rules to parse.
 * @param {boolean} deleteExisting Whether to delete existing compendium entries before importing.
 */
export async function createCompendiumFromRules(
  rulesUrl,
  compendiumLabels,
  progressCallback = undefined,
  deleteExistingCompendium = false,
  overwriteExistingTemplates = false,
) {
  // Retrieve the rules from the provided URL
  const rulesFetch = await fetch(rulesUrl);
  const rulesBlob = await rulesFetch.blob();
  const rulesText = await rulesBlob.text();

  // Parse the rules using the FarhomeRuleParser
  const ruleParser = new FarhomeRuleParser();
  const parsedRules = ruleParser.parse(rulesText);

  const parsedRulesEntries = Object.entries(parsedRules);

  // Setup status bar variables
  let currentStatus = 0;
  const maxStatus = parsedRulesEntries.reduce((accumulator, arrayValue) => accumulator + arrayValue[1].length, 0);

  // Enumerate through the parsed rule categories and create compendium entries
  for (let ruleEntryIndex = 0; ruleEntryIndex < parsedRulesEntries.length; ruleEntryIndex++) {
    // Send the progress state to the callback
    if (typeof progressCallback === 'function') {
      progressCallback(currentStatus, maxStatus);
    }

    const key = parsedRulesEntries[ruleEntryIndex][0];
    const items = parsedRulesEntries[ruleEntryIndex][1];

    const compendiumLabel = compendiumLabels.get(key);
    if (!compendiumLabel) {
      throw new Error(`Compendium label not found for key ${key}`);
    }

    const compendiumName = compendiumLabel.toLowerCase().replace(/ /g, '-');
    const worldCompendiumName = `world.${compendiumName}`;

    // Delete existing compediums if requested
    if (deleteExistingCompendium && game.packs.has(worldCompendiumName)) {
      game.packs.get(worldCompendiumName).deleteCompendium();
    }

    // Create the compendium if it doesn't already exist
    let worldCompendium = undefined;
    if (game.packs.has(worldCompendiumName)) {
      worldCompendium = game.packs.get(worldCompendiumName);
    } else {
      worldCompendium = await CompendiumCollection.createCompendium({
        name: compendiumName,
        label: compendiumLabel,
        type: 'Item',
        system: 'farhome',
        package: 'system',
      });
    }

    // Optimize duplicate entry lookup by creating a new map with name->object mapping instead of id->object mapping
    const worldCompendiumNameMap = new Map();
    for (const [_key, item] of worldCompendium.index.entries()) {
      worldCompendiumNameMap.set(item.name, item);
    }

    for (const item of items) {
      const existingEntry = worldCompendiumNameMap.get(item.name);
      if (existingEntry) {
        console.log(`Updating existing item ${item.name} in compendium ${worldCompendiumName}`);

        // This is how you can get the existing document from the compendium, but it isn't necessary right now and
        // is just here for reference.
        // const itemDocument = await worldCompendium.getDocument(existingEntry._id);

        if (!overwriteExistingTemplates) {
          // Remove the rollTemplate field from the update data so it doesn't overwrite in updateDocuments
          delete item.system.rollTemplate;
        }

        // Add the id to the item data so that it knows what item update.
        item._id = existingEntry._id;

        await game.farhome.FarhomeItem.updateDocuments([item], { pack: worldCompendiumName });
      } else {
        console.log(`Adding new item ${item.name} to compendium ${worldCompendiumName}`);
        await game.farhome.FarhomeItem.createDocuments([item], { pack: worldCompendiumName });
      }

      currentStatus++;
      if (typeof progressCallback === 'function') {
        progressCallback(currentStatus, maxStatus);
      }
    }
  }

  // Send the progress state to the callback
  if (typeof progressCallback === 'function') {
    progressCallback(currentStatus, maxStatus);
  }
}

/**
 * A parser for Farhome rules.
 */
class FarhomeRuleParser {
  /**
   * Constructor to setup class variables.
   */
  constructor() {
    this.conditions = [];
    this.feats = [];
    this.backgrounds = [];
    this.maneuvers = [];
    this.spells = [];

    // There are 6 heading levels
    this._headingStack = Array(maxHeadingLevel).fill('');
    this._currentHeadingLevel = 1;
  }

  /**
   * Parse a string of Farhome rules represented as markdown text.
   * @param {string} markdownString A string of markdown with the full ruleset to parse.
   * @returns {object} An object containing the parsed rules.
   */
  parse(markdownString) {
    // Convert the markdown to an HTML document
    const markdownHtml = marked.parse(markdownString);
    const domParser = new DOMParser();
    const htmlDoc = domParser.parseFromString(markdownHtml, 'text/html');

    // Initiailze iterative variables
    let spellSchool = '';

    // Iterate through the document line by line
    // #todo Consider using htmlDoc.body and then using nextElementSibling
    const htmlList = htmlDoc.body.children;
    //const selectAll = htmlDoc.querySelectorAll('*');
    for (let nodeIndex = 0; nodeIndex < htmlList.length; nodeIndex++) {
      let element = htmlList[nodeIndex];

      //
      // Process headings and track the heading stack and current level
      //
      if (FarhomeRuleParser._isHeading(element.nodeName)) {
        this._currentHeadingLevel = FarhomeRuleParser._getHeadingLevel(element.nodeName);
        this._headingStack[this._getCurrentHeadingLevelIndex()] = element.innerText;

        // Clear the heading stack above the current level
        for (
          let headingIndex = this._getCurrentHeadingLevelIndex() + 1;
          headingIndex < maxHeadingLevel;
          headingIndex++
        ) {
          this._headingStack[headingIndex] = '';
        }
      }

      //
      // Add conditions
      //
      const conditionHeadingIndex = this._getHeadingIndexInStack(['Conditions']);
      if (
        this._currentHeadingLevel > 0 &&
        FarhomeRuleParser._isHeading(element.nodeName) &&
        conditionHeadingIndex !== -1 &&
        conditionHeadingIndex < this._getCurrentHeadingLevelIndex()
      ) {
        // Get the node name
        const conditionName = element.innerText;

        // Skip past the header to consume the content
        nodeIndex++;

        // Do a fast forward loop to get all the content
        let contentHtml = '';

        // Iterate and add all the content
        while (
          nodeIndex < htmlList.length &&
          htmlList[nodeIndex] &&
          !FarhomeRuleParser._isHeading(htmlList[nodeIndex].nodeName)
        ) {
          contentHtml += htmlList[nodeIndex].outerHTML;
          nodeIndex++;
        }

        // Add feat to the list
        this._addBaseItem(this.conditions, conditionName, 'condition', contentHtml);

        // Re-wind since it stopped at the next heading to know the block was done and that next heading may be required for processing.
        if (nodeIndex < htmlList.length) {
          nodeIndex--;
        }

        // Continue processing at the next line
        continue;
      }

      //
      // Process non-background related feats
      //
      const featHeadingIndex = this._getHeadingIndexInStack(['Basic', 'Journeyman', 'Advanced', 'Legendary']);
      if (
        this._currentHeadingLevel > 0 &&
        FarhomeRuleParser._isHeading(element.nodeName) &&
        featHeadingIndex !== -1 &&
        featHeadingIndex < this._getCurrentHeadingLevelIndex()
      ) {
        // Get the node name
        const featName = element.innerText;

        // Skip past the header to consume the content
        nodeIndex++;

        // Do a fast forward loop to get all the content
        let contentHtml = '';

        // Iterate and add all the content
        while (
          nodeIndex < htmlList.length &&
          htmlList[nodeIndex] &&
          !FarhomeRuleParser._isHeading(htmlList[nodeIndex].nodeName)
        ) {
          contentHtml += htmlList[nodeIndex].outerHTML;
          nodeIndex++;
        }

        // Add feat to the list
        this._addBaseItem(this.feats, featName, 'feat', contentHtml);

        // Re-wind since it stopped at the next heading to know the block was done and that next heading may be required for processing.
        if (nodeIndex < htmlList.length) {
          nodeIndex--;
        }

        // Continue processing at the next line
        continue;
      }

      //
      // Add background related feats
      //
      const backgroundHeadingIndex = this._getHeadingIndexInStack(['Backgrounds']);
      if (
        this._currentHeadingLevel > 0 &&
        FarhomeRuleParser._isHeading(element.nodeName) &&
        backgroundHeadingIndex !== -1 &&
        backgroundHeadingIndex < this._getCurrentHeadingLevelIndex()
      ) {
        // Get the node name
        const backgroundName = element.innerText;

        // Skip past the header to consume the content
        nodeIndex++;

        // Do a fast forward loop to get all the content
        let contentHtml = '';

        // Iterate and add all the content
        while (
          nodeIndex < htmlList.length &&
          htmlList[nodeIndex] &&
          !FarhomeRuleParser._isHeading(htmlList[nodeIndex].nodeName)
        ) {
          contentHtml += htmlList[nodeIndex].outerHTML;
          nodeIndex++;
        }

        // Add feat to the list
        this._addBaseItem(this.backgrounds, backgroundName, 'feat', contentHtml);

        // Re-wind since it stopped at the next heading to know the block was done and that next heading may be required for processing.
        if (nodeIndex < htmlList.length) {
          nodeIndex--;
        }

        // Continue processing at the next line
        continue;
      }

      //
      // #todo Add maneuvers
      //
      const maneuverHeadings = ['Maneuvers'];

      const maneuverLevelHeadings = [];
      const lowestManeuverLevel = 1;
      const highestManeuverLevel = 12;
      for (
        let currentManeuverLevel = lowestManeuverLevel;
        currentManeuverLevel <= highestManeuverLevel;
        currentManeuverLevel++
      ) {
        maneuverLevelHeadings.push(`Level ${currentManeuverLevel}`);
      }

      const maneuverHeadingIndex = this._getHeadingIndexInStack(maneuverLevelHeadings);
      if (
        this._currentHeadingLevel > 0 &&
        FarhomeRuleParser._isHeading(element.nodeName) &&
        maneuverHeadingIndex !== -1 &&
        maneuverHeadingIndex < this._getCurrentHeadingLevelIndex()
      ) {
        // Get the node name
        const maneuverName = element.innerText;
        const maneuverNameHeaderLevel = this._currentHeadingLevel;

        // Skip past the header to consume the content
        nodeIndex++;

        // Do a fast forward loop to get all the content
        let contentHtml = '';
        let maneuverApCost = '';
        let maneuverWeaponRequirement = '';
        let maneuverRange = '';
        let maneuverLevelRequirement = '';

        while (
          nodeIndex < htmlList.length &&
          htmlList[nodeIndex] &&
          !(
            FarhomeRuleParser._isHeading(htmlList[nodeIndex].nodeName) &&
            FarhomeRuleParser._getHeadingLevel(htmlList[nodeIndex].nodeName) <= maneuverNameHeaderLevel
          )
        ) {
          // Parse an attribute if it is there, setting the value when found, and skipping the line if it is parsed.
          this._parseAttribute((val) => (maneuverApCost = val), 'AP Cost:', htmlList[nodeIndex].innerText);
          this._parseAttribute((val) => (maneuverWeaponRequirement = val), 'Weapon:', htmlList[nodeIndex].innerText);
          this._parseAttribute((val) => (maneuverRange = val), 'Range:', htmlList[nodeIndex].innerText);
          this._parseAttribute(
            (val) => (maneuverLevelRequirement = val),
            'Level Required:',
            htmlList[nodeIndex].innerText,
          );

          contentHtml += htmlList[nodeIndex].outerHTML;

          nodeIndex++;
        }

        // Add spell to the list
        this._addManeuver(
          maneuverName,
          contentHtml,
          maneuverApCost,
          maneuverWeaponRequirement,
          maneuverRange,
          maneuverLevelRequirement,
        );

        // Re-wind since it stopped at the next heading to know the block was done and that next heading may be required for processing.
        if (nodeIndex < htmlList.length) {
          nodeIndex--;
        }

        // Continue processing at the next line
        continue;
      }

      //
      // Add spells
      //
      const spellHeadings = ['Arcane', 'Divine', 'Druidic', 'Elder', 'Occult'];

      if (spellHeadings.includes(this._recentHeading())) {
        // Make a deep copy of the spell school since the recent heading is subject to change and erasure.
        spellSchool = this._recentHeading();
      }

      const spellLevelHeadings = [
        'Cantrips',
        'First Level',
        'Second Level',
        'Third Level',
        'Fourth Level',
        'Fifth Level',
        'Sixth Level',
        'Seventh Level',
        'Eighth Level',
        'Ninth Level',
      ];

      const spellHeadingToLevel = {
        Cantrips: 0,
        'First Level': 1,
        'Second Level': 2,
        'Third Level': 3,
        'Fourth Level': 4,
        'Fifth Level': 5,
        'Sixth Level': 6,
        'Seventh Level': 7,
        'Eighth Level': 8,
        'Ninth Level': 9,
      };

      const spellHeadingIndex = this._getHeadingIndexInStack(spellLevelHeadings);
      if (
        this._currentHeadingLevel > 0 &&
        FarhomeRuleParser._isHeading(element.nodeName) &&
        spellHeadingIndex !== -1 &&
        spellHeadingIndex < this._getCurrentHeadingLevelIndex()
      ) {
        // Get the node name
        const spellName = element.innerText;
        const spellNameHeaderLevel = this._currentHeadingLevel;

        // Get the spell level
        const spellLevel = spellHeadingToLevel[this._headingStack[spellHeadingIndex]];

        // Skip past the header to consume the content
        nodeIndex++;

        // Do a fast forward loop to get all the content
        let contentHtml = '';
        let spellCastingTime = '';
        let spellRange = '';
        let spellDuration = '';
        let spellDamageType = '';

        while (
          nodeIndex < htmlList.length &&
          htmlList[nodeIndex] &&
          !(
            FarhomeRuleParser._isHeading(htmlList[nodeIndex].nodeName) &&
            FarhomeRuleParser._getHeadingLevel(htmlList[nodeIndex].nodeName) <= spellNameHeaderLevel
          )
        ) {
          // Parse an attribute if it is there, setting the value when found, and skipping the line if it is parsed.
          this._parseAttribute((val) => (spellCastingTime = val), 'Casting Time:', htmlList[nodeIndex].innerText);
          this._parseAttribute((val) => (spellRange = val), 'Range:', htmlList[nodeIndex].innerText);
          this._parseAttribute((val) => (spellDuration = val), 'Duration:', htmlList[nodeIndex].innerText);
          this._parseAttribute((val) => (spellDamageType = val), 'Damage Type:', htmlList[nodeIndex].innerText);

          contentHtml += htmlList[nodeIndex].outerHTML;

          nodeIndex++;
        }

        // Add spell to the list
        this._addSpell(
          spellName,
          contentHtml,
          spellLevel,
          spellSchool,
          spellCastingTime,
          spellRange,
          spellDuration,
          spellDamageType,
        );

        // Re-wind since it stopped at the next heading to know the block was done and that next heading may be required for processing.
        if (nodeIndex < htmlList.length) {
          nodeIndex--;
        }

        // Continue processing at the next line
        continue;
      }
    }

    // Sort the lists
    this.backgrounds.sort((backgroundA, backgroundB) => backgroundA.name.localeCompare(backgroundB.name));
    this.conditions.sort((conditionA, conditionB) => conditionA.name.localeCompare(conditionB.name));
    this.feats.sort((featA, featB) => featA.name.localeCompare(featB.name));
    this.maneuvers.sort((maneuverA, maneuverB) => maneuverA.name.localeCompare(maneuverB.name));
    this.spells.sort((spellA, spellB) => spellA.name.localeCompare(spellB.name));

    // Return the rules data
    const rulesData = {
      backgrounds: this.backgrounds,
      conditions: this.conditions,
      feats: this.feats,
      maneuvers: this.maneuvers,
      spells: this.spells,
    };

    return rulesData;
  }

  /**
   * Parses an attribute out of string and sets the value if found.
   * @param {string} setValueFunction Callback function to set the value for the found capture.
   * @param {string} searchString The string to search for.
   * @param {string} lineText The text to search in.
   */
  _parseAttribute(setValueFunction, searchString, lineText) {
    const regex = new RegExp(`(${searchString})\s*([^\\n]+)`, 'g');
    const match = regex.exec(lineText);

    if (match) {
      setValueFunction(match[2].trim());
      return true;
    }

    return false;
  }

  /**
   * Checks if the nodeName is an HTML heading.
   * @param {string} nodeName The name of the node to check.
   * @returns {boolean} True if the nodeName is an HTML heading.
   * @private
   */
  static _isHeading(nodeName) {
    return nodeName.toUpperCase()[0] === 'H' && nodeName[1] >= '0' && nodeName[1] <= '6';
  }

  /**
   * Gets the heading level from the nodeName.
   * @param {string} nodeName The name of the node to check. It is expected that this is an HTML H# heading already.
   * @returns {number} The heading level.
   * @private
   * @throws {Error} If the nodeName is not an HTML heading.
   */
  static _getHeadingLevel(nodeName) {
    const headingLevel = parseInt(nodeName[1]);
    if (Number.isInteger(headingLevel) && headingLevel >= 1 && headingLevel <= 6) {
      return headingLevel;
    } else {
      throw new Error(`${nodeName} does not have a valid heading level`);
    }
  }

  /**
   * Gets the current array index for the current heading level from the heading stack.
   * @returns {number} The current array index for the current heading level from the heading stack.
   * @private
   */
  _getCurrentHeadingLevelIndex() {
    return this._currentHeadingLevel - 1;
  }

  /**
   * Gets the position of the heading in the heading stack that matches one of the headings in the list.
   * @param {string[]} headingList The list of headings to check. It returns the first match.
   * @returns {number} The position of the heading in the heading stack that matches one of the headings in the list. -1 if none match.
   * @private
   */
  _getHeadingIndexInStack(headingList) {
    for (let headingIndex = this._getCurrentHeadingLevelIndex(); headingIndex >= 0; headingIndex--) {
      if (headingList.includes(this._headingStack[headingIndex])) {
        return headingIndex;
      }
    }

    return -1;
  }

  /**
   * Checks if a heading is in the current heading stack.
   * @param {string} headingList List of headings to check if they are in the stack. If any of them are in the stack, it returns true.
   * @returns {boolean} True if any of the headings are in the stack.
   * @private
   */
  _isHeadingInStack(headingList) {
    return this._getHeadingIndexInStack(headingList) !== -1;
  }

  /**
   * Gets the most recent heading in the heading stack.
   * @returns {string} The most recent heading in the heading stack.
   * @private
   */
  _recentHeading() {
    return this._headingStack[this._getCurrentHeadingLevelIndex()];
  }

  /**
   * Adds a base item to the given list of base items.
   * @param {string} list The list of base items to add to.
   * @param {string} name The name of the base item.
   * @param {string} description The description of the base item.
   * @private
   */
  _addBaseItem(list, name, type, description) {
    const baseItemRollTemplate = `
      <h1>[[i.name]]</h1>
      <p>[[i.description]]</p>`;

    // Add a new feat object to the list
    const baseItemObject = {
      name: name,
      type: type,
      system: {
        description: {
          value: description,
        },
        rollTemplate: {
          value: baseItemRollTemplate,
        },
      },
    };

    list.push(baseItemObject);
  }

  /**
   * Adds a maneuver to the list of maneuvers.
   * @param {string} name The name of the maneuver.
   * @param {string} description The description of the maneuver.
   * @param {string} apCosts The AP costs for the maneuver.
   * @param {string} weaponRequirements The weapon requirements of the maneuver.
   * @param {string} range The range of the maneuver.
   * @param {string} levelRequirements The level requirements for the maneuver.
   */
  _addManeuver(name, description, apCosts, weaponRequirements, range, lavelRequirements) {
    // #todo Enhance the maneuver roll template here (need a complex parser but a simple fh(formula()) should be fine for now)
    //       Create an maneuver description parser function that breaks things down into an object with targetScaling, woundScaling, guaranteedWoundScaling, levelScaling, etc.
    //       Use all that information to build a more powerful roll template.

    // Do some parsing to determine what type of roll this maneuver may use.
    let maneuverRoll = '';

    // Parse the weapon type requirements to determine a roll template.
    const weaponRequirementsLower = weaponRequirements.toLowerCase();
    if (weaponRequirementsLower.includes('ranged')) {
      maneuverRoll = `<p>[[fh(formula(a.ranged, a.dex))]]</p>`;
    } else if (weaponRequirementsLower.includes('unarmed')) {
      maneuverRoll = `<p>[[fh(formula(a.unarmed, a.maxStrDex))]]</p>`;
    } else if (weaponRequirementsLower.includes('one') && weaponRequirementsLower.includes('hand')) {
      maneuverRoll = `<p>[[fh(formula(a.oneHand, a.maxStrDex))]]</p>`;
    } else if (weaponRequirementsLower.includes('two') && weaponRequirementsLower.includes('hand')) {
      maneuverRoll = `<p>[[fh(formula(a.twoHand, a.maxStrDex))]]</p>`;
    } else if (weaponRequirementsLower.includes('shield')) {
      // Shield needs special parsing logic and could be an attack, defense, or a save.
      // For now, just return nothing
      maneuverRoll = ``;
    } else if (weaponRequirementsLower.includes('any')) {
      // The remainder of rolls should just use something generic for any melee weapon.
      maneuverRoll = `<p>[[fh(formula(a.maxOneTwoHand, a.maxStrDex))]]</p>`;
    }

    // Construct the maneuver roll template
    const maneuverRollTemplate = `
      <h1>[[i.name]]</h1>
      <p>[[i.description]]</p>
      ${maneuverRoll}`;

    // Add a new spell object to the list
    const spellObject = {
      name: name,
      type: 'maneuver',
      system: {
        description: {
          value: description,
        },
        rollTemplate: {
          value: maneuverRollTemplate,
        },
        apCosts: {
          value: apCosts,
        },
        weaponRequirements: {
          value: weaponRequirements,
        },
        range: {
          value: range,
        },
        levelRequirements: {
          value: lavelRequirements,
        },
      },
    };

    this.maneuvers.push(spellObject);
  }

  /**
   * Adds a spell to the list of spells.
   * @param {string} name The name of the spell.
   * @param {string} level The level of the spell.
   * @param {string} school The school of the spell.
   * @param {string} castingTime The casting time of the spell.
   * @param {string} range The range of the spell.
   * @param {string} duration The duration of the spell.
   * @param {string} damageType The damage type of the spell.
   * @param {string} description The description of the spell.
   */
  _addSpell(name, description, level, school, castingTime, range, duration, damageType) {
    // #todo Enhance the spell roll template here (need a complex parser but a simple fh(formula()) should be fine for now)
    //       Create an spell description parser function that breaks things down into an object with targetScaling, woundScaling, guaranteedWoundScaling, levelScaling, etc.
    //       Use all that information to build a more powerful roll template.

    // Do some parsing to determine what type of roll this maneuver may use.
    let spellRoll = '';

    // Parse the spell school to determine a roll template.
    // This can be made more advanced later by also parsing the description.
    const schoolLower = school.toLowerCase();
    if (schoolLower.includes('arcane')) {
      spellRoll = `<p>[[fh(formula(a.arcane, a.int))]]</p>`;
    } else if (schoolLower.includes('divine')) {
      spellRoll = `<p>[[fh(formula(a.divine, a.cha))]]</p>`;
    } else if (schoolLower.includes('druidic')) {
      spellRoll = `<p>[[fh(formula(a.druidic, a.will))]]</p>`;
    } else if (schoolLower.includes('elder')) {
      spellRoll = `<p>[[fh(formula(a.elder, a.sta))]]</p>`;
    } else if (schoolLower.includes('occult')) {
      spellRoll = `<p>[[fh(formula(a.occult, a.will))]]</p>`;
    }

    // Construct the spell roll template
    const spellRollTemplate = `
      <h1>[[i.name]] (Lv [[i.castedSpellLevel]])</h1>
      <p>[[i.description]]</p>
      ${spellRoll}`;

    // Add a new spell object to the list
    const spellObject = {
      name: name,
      type: 'spell',
      system: {
        description: {
          value: description,
        },
        rollTemplate: {
          value: spellRollTemplate,
        },
        spellLevel: {
          value: level,
        },
        spellSchool: {
          value: school,
        },
        castingTime: {
          value: castingTime,
        },
        range: {
          value: range,
        },
        duration: {
          value: duration,
        },
        damageType: {
          value: damageType,
        },
      },
    };

    this.spells.push(spellObject);
  }
}
