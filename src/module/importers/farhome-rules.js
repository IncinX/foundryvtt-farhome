import { marked } from 'marked';

const maxHeadingLevel = 6;

/**
 * Creates new compendiums based on input Farhome rulesets.
 * @param {Map<String, String>} compendiumLabels Map to translate compendium names to labels. Expected keys: "feats", "backgrounds", "conditions", "maneuvers", "spells"
 * @param {string} rulesUrl String to the URL containing the raw markdown for the rules to parse.
 * @param {boolean} deleteExisting Whether to delete existing compendium entries before importing.
 */
export async function createCompendiumFromRules(compendiumLabels, rulesUrl, deleteExisting = true) {
  const rulesFetch = await fetch(rulesUrl);
  const rulesBlob = await rulesFetch.blob();
  const rulesText = await rulesBlob.text();

  const ruleParser = new FarhomeRuleParser();
  const parsedRules = ruleParser.parse(rulesText);

  console.log(parsedRules);

  for (const [key, value] of Object.entries(parsedRules)) {
    const compendiumLabel = compendiumLabels.get(key);
    if (!compendiumLabel) {
      throw new Error(`Compendium label not found for key ${key}`);
    }

    const compendiumName = compendiumLabel.toLowerCase().replace(/ /g, '-');
    const worldCompendiumName = `world.${compendiumName}`;

    if (deleteExisting) {
      if (game.packs.has(worldCompendiumName)) {
        await game.packs.get(worldCompendiumName).deleteCompendium();
      }
    }

    await CompendiumCollection.createCompendium({
      name: compendiumName,
      label: compendiumLabel,
      type: 'Item',
      system: 'farhome',
      package: 'system',
    });

    await game.farhome.FarhomeItem.createDocuments(value, { pack: worldCompendiumName });
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
      // #todo Add conditions
      //

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

        // #todo Is it possible to just change htmlList[i] to be an enumerator that can go to next or previous?
        // #bug This isn't grabbing all the content HTML
        while (
          nodeIndex < htmlList.length &&
          htmlList[nodeIndex] &&
          !FarhomeRuleParser._isHeading(htmlList[nodeIndex].nodeName)
        ) {
          contentHtml += htmlList[nodeIndex].outerHTML;
          nodeIndex++;
        }

        // Add feat to the list
        this._addFeat(featName, contentHtml);

        // Re-wind since it stopped at the next heading to know the block was done and that next heading may be required for processing.
        if (nodeIndex < htmlList.length) {
          nodeIndex--;
        }

        // Continue processing at the next line
        continue;
      }

      //
      // #todo Add backgrounds
      //

      //
      // #todo Add maneuvers
      //

      //
      // #todo Add spells
      //
      // #todo Look into reducing code duplication in some way after the spell stuff is working.
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
   * Adds a feat to the list of feats.
   * @param {string} name The name of the feat.
   * @param {string} description The description of the feat.
   * @private
   */
  _addFeat(name, description) {
    const featRollTemplate = `
      <h1>[[i.name]]</h1>
      <p>[[i.description]]</p>`;

    // Add a new feat object to the list
    const featObject = {
      name: name,
      type: 'feat',
      data: {
        description: {
          value: description,
        },
        rollTemplate: {
          value: featRollTemplate,
        },
      },
    };

    this.feats.push(featObject);
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
    const spellRollTemplate = `
      <h1>[[i.name]]</h1>
      <p>[[i.description]]</p>`;

    // #todo Need to set the attributes of the spell as well (and add everything to a compendium)

    // Add a new spell object to the list
    const spellObject = {
      name: name,
      type: 'spell',
      data: {
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
