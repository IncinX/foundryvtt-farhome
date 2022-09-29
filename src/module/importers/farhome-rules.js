import { marked } from 'marked';

export async function createCompendiumFromRules(compendiumLabel, rulesUrl, deleteExisting = true) {
  const rulesFetch = await fetch(rulesUrl);
  const rulesBlob = await rulesFetch.blob();
  const rulesText = await rulesBlob.text();

  const ruleParser = new FarhomeRuleParser();
  const parsedRules = ruleParser.parse(rulesText);

  console.log(parsedRules);

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

  await game.farhome.FarhomeItem.createDocuments(parsedRules.feats, { pack: worldCompendiumName });
}

class FarhomeRuleParser {
  constructor() {
    this.feats = [];
    this.backgrounds = [];
    this.maneuvers = [];
    this.spells = [];

    // There are 6 heading levels
    this._headingStack = Array(6).fill('');
    this._currentHeadingLevel = 1;
  }

  parse(markdownString) {
    // Convert the markdown to an HTML document
    const markdownHtml = marked.parse(markdownString);
    const domParser = new DOMParser();
    const htmlDoc = domParser.parseFromString(markdownHtml, 'text/html');

    // Iterate through the document line by line
    const selectAll = htmlDoc.querySelectorAll('*');
    for (let nodeIndex = 0; nodeIndex < selectAll.length; nodeIndex++) {
      let element = selectAll[nodeIndex];

      // Process headings and track the heading stack and current level
      if (this._isHeading(element.nodeName)) {
        this._currentHeadingLevel = this._getHeadingLevel(element.nodeName);
        this._headingStack[this._getCurrentHeadingLevelIndex()] = element.innerText;
      }

      // Process non-background related feats
      const featHeadingPosition = this._getHeadingPositionInStack(['Basic', 'Journeyman', 'Advanced', 'Legendary']);
      if (
        this._currentHeadingLevel > 0 &&
        this._isHeading(element.nodeName) &&
        featHeadingPosition !== -1 &&
        featHeadingPosition < this._getCurrentHeadingLevelIndex()
      ) {
        // Get the node name
        const featName = element.innerText;

        // Skip past the header to consume the content
        nodeIndex++;

        // Do a fast forward loop to get all the content
        let contentHtml = '';

        // #todo Is it possible to just change selectAll[i] to be an enumerator that can go to next or previous?
        // #bug This isn't grabbing all the content HTML
        while (
          nodeIndex < selectAll.length &&
          selectAll[nodeIndex] &&
          !this._isHeading(selectAll[nodeIndex].nodeName)
        ) {
          contentHtml += selectAll[nodeIndex].outerHTML;
          nodeIndex++;
        }

        // Add feat directly without any special lookup non-sense
        this._addFeat(this._recentHeading(), contentHtml);

        // Re-wind since it stopped at the next heading to know the block was done and that next heading may be required for processing.
        if (nodeIndex < selectAll.length) {
          nodeIndex--;
        }

        // Continue processing at the next line
        continue;
      }

      // #todo Add backgrounds

      // #todo Add maneuvers

      // #todo Add spells
      const spellHeadings = ['Arcane', 'Divine', 'Druidic', 'Elder', 'Occult'];

      let spellSchool = '';

      if (spellHeadings.includes(this._recentHeading())) {
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

      if (this._isHeadingInStack(spellLevelHeadings)) {
        // #todo _recentHeading() is going to throw off the spell name if there is a sub-heading in the spell description
        //       Need to take this out of a P check and instead just add everything for a spell name that is at the top level.
        //       and treat new headings as content.
        //       Maybe modify it to find spell headings and then create an inner loop to pull content. We can do this for feats and maneuvers too and make it simpler.
        //this._addSpell(this._recentHeading(), spellSchool, element.outerHTML);
      }
    }

    const rulesData = {
      feats: this.feats,
      backgrounds: this.backgrounds,
      maneuvers: this.maneuvers,
      spells: this.spells,
    };

    return rulesData;
  }

  _processElement(_index, element) {}

  _isHeading(nodeName) {
    return nodeName.toUpperCase()[0] === 'H' && nodeName[1] >= '0' && nodeName[1] <= '6';
  }

  _getCurrentHeadingLevelIndex() {
    return this._currentHeadingLevel - 1;
  }

  _getHeadingLevel(nodeName) {
    const headingLevel = parseInt(nodeName[1]);
    if (Number.isInteger(headingLevel) && headingLevel >= 1 && headingLevel <= 6) {
      return headingLevel;
    } else {
      console.error(nodeName + ' does not have a valid heading level');
    }
  }

  _getHeadingPositionInStack(headingList) {
    for (let headingIndex = this._getCurrentHeadingLevelIndex(); headingIndex >= 0; headingIndex--) {
      if (headingList.includes(this._headingStack[headingIndex])) {
        return headingIndex;
      }
    }

    return -1;
  }

  _isHeadingInStack(headingList) {
    return this._getHeadingPositionInStack(headingList) !== -1;
  }

  _recentHeading() {
    return this._headingStack[this._getCurrentHeadingLevelIndex()];
  }

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

  _addSpell(name, spellSchool, description) {
    // #todo Need to set the attributes of the spell as well

    // #todo Enhance the spell roll template here (need a complex parser but a simple fh(formula()) should be fine for now)
    const spellRollTemplate = `
      <h1>[[i.name]]</h1>
      <p>[[i.description]]</p>`;

    // Add a new spell object to the list
    const spellObject = {
      name: name,
      type: 'spell',
      data: {
        spellSchool: {
          value: spellSchool,
        },
        description: {
          value: description,
        },
        rollTemplate: {
          value: spellRollTemplate,
        },
      },
    };

    this.spells.push(spellObject);
  }
}
