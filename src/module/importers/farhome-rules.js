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

    this.featsLookup = {};
    this.backgroundsLookup = {};
    this.maneuversLookup = {};
    this.spellsLookup = {};

    // There are 6 heading levels
    this.headingStack = Array(6).fill('');
    this.currentHeadingLevel = 1;
  }

  parse(markdownString) {
    const markdownHtml = marked.parse(markdownString);
    const markdownHtmlQuery = $(markdownHtml);

    markdownHtmlQuery.each((_index, element) => {
      this._processElement(_index, element);
    });

    const rulesData = {
      feats: this.feats,
      backgrounds: this.backgrounds,
      maneuvers: this.maneuvers,
      spells: this.spells,
    };

    return rulesData;
  }

  _processElement(_index, element) {
    // Process headings and track the heading stack and current level
    if (this._isHeading(element.nodeName)) {
      this.currentHeadingLevel = this._getHeadingLevel(element.nodeName);
      this.headingStack[this.currentHeadingLevel - 1] = element.innerText;
    }

    if (element.nodeName === 'P') {
      // Process non-background related feats
      if (this._headingsInStack(['Basic', 'Journeyman', 'Advanced', 'Legendary'])) {
        this._addFeatInfo(this._recentHeading(), element.outerHTML);
      }

      // #todo Add backgrounds

      // #todo Add maneuvers

      // #todo Add spells
    }
  }

  _isHeading(nodeName) {
    return nodeName.toUpperCase()[0] === 'H';
  }

  _getHeadingLevel(nodeName) {
    const headingLevel = parseInt(nodeName[1]);
    if (Number.isInteger(headingLevel) && headingLevel >= 1 && headingLevel <= 6) {
      return headingLevel;
    } else {
      console.error(nodeName + ' does not a valid heading level');
    }
  }

  _headingsInStack(headingList) {
    for (let headingIndex = this.currentHeadingLevel - 1; headingIndex >= 0; headingIndex--) {
      if (headingList.includes(this.headingStack[headingIndex])) {
        return true;
      }
    }

    return false;
  }

  _recentHeading() {
    return this.headingStack[this.currentHeadingLevel - 1];
  }

  _addFeatInfo(name, description) {
    const existingFeat = this.featsLookup[name];

    if (existingFeat) {
      // Append the description to the existing feat
      existingFeat.data.description.value += description;
    } else {
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
      this.featsLookup[name] = featObject;
    }
  }
}
