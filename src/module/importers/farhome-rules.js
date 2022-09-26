import { marked } from 'marked';

// #todo Add support for DOMPurify later
//import DOMPurify from 'isomorphic-dompurify';

export async function createCompendiumFromRules(rulesUrl) {
  const rulesFetch = await fetch(rulesUrl);
  const rulesBlob = await rulesFetch.blob();
  const rulesText = await rulesBlob.text();

  const ruleParser = new FarhomeRuleParser();
  const parsedRules = ruleParser.parse(rulesText);

  console.log(parsedRules);

  // DEBUG! Skip the rest for now
  return;

  CompendiumCollection.createCompendium({
    name: 'feats-compendium',
    label: 'Feats Compendium',
    type: 'Item',
    system: 'farhome',
    package: 'system',
  });

  game.farhome.FarhomeItem.createDocuments(
    [
      {
        name: 'TestFeat',
        type: 'feat',
      },
    ],
    {
      pack: 'world.feats-compendium',
    },
  );
}

class FarhomeRuleParser {
  constructor() {
    this.feats = [];
    this.backgrounds = [];
    this.maneuvers = [];
    this.spells = [];

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
      // Process basic feats
      // #todo Almost working, it needs to handle requirements and appending text if it exists.
      if (this._headingsInStack(['Basic', 'Journeyman', 'Advanced', 'Legendary'])) {
        this._addFeat(this._recentHeading(), element.outerHtml);
      }
    }
  }

  _isHeading(nodeName) {
    return nodeName.toUpperCase()[0] === 'H';
  }

  _getHeadingLevel(nodeName) {
    const headingLevel = parseInt(nodeName[1]);
    if (Number.isInteger(headingLevel) && (headingLevel >= 1) && (headingLevel <= 6)) {
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

  _addFeat(name, description) {
    this.feats.push({
      name: name,
      type: 'feat',
      data: {
        description: {
          value: description,
        },
      },
    });
  }
}