import { createCompendiumFromRules } from '../importers/farhome-rules-importer';

/**
 * 5etools monster importer form application.
 * @extends {FormApplication}
 */
class FarhomeRulesImporterApplication extends FormApplication {
  constructor() {
    let data = {
      rulesUrl: '',
      backgroundsCompendiumName: 'Farhome Backgrounds',
      conditionsCompendiumName: 'Farhome Conditions',
      featsCompendiumName: 'Farhome Feats',
      maneuversCompendiumName: 'Farhome Maneuvers',
      spellsCompendiumName: 'Farhome Spells',
    };

    super(data, {});
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      template: `systems/farhome/templates/apps/farhome-rules-importer-app.hbs`,
      id: 'farhome-rules-importer',
      title: 'Farhome Rules Importer',
      closeOnSubmit: false,
      width: 400,
    });
  }

  getData() {
    return super.getData().object;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  _progressCallback(progressValue, progressMax) {
    let importButton = $(this.form).find('#import');
    let progress = $(this.form).find('#progress');

    // Update the progress
    progress[0].value = progressValue;
    progress[0].max = progressMax;

    if (progressValue === progressMax) {
      // Hide the progress bar and enable the import button if it is done importing.
      progress[0].style.opacity = 0;
      importButton[0].disabled = false;
    } else {
      // Show the progress bar and disable the import button if it is not done importing.
      progress[0].style.opacity = 1;
      importButton[0].disabled = true;
    }
  }

  async _updateObject(_event, formData) {
    const compendiumLabels = new Map([
      ['feats', formData.featsCompendiumName],
      ['conditions', formData.conditionsCompendiumName],
      ['backgrounds', formData.backgroundsCompendiumName],
      ['maneuvers', formData.maneuversCompendiumName],
      ['spells', formData.spellsCompendiumName],
    ]);

    await createCompendiumFromRules(formData.rulesUrl, compendiumLabels, this._progressCallback.bind(this));
  }
}

export function connectRulesImporterApp() {
  Hooks.on('renderSidebarTab', async (app, html) => {
    if (app.options.id == 'compendium') {
      // Only connect this if the user is the GM
      if (!game.user.isGM) return;

      let button = $(`
        <div class="header-actions action-buttons flexrow">
          <button class="import-farhome-rules">
            <i class="fas fa-file-import"></i> Import Farhome Rules
          </button>
        </div>`);

      button.on('click', () => new FarhomeRulesImporterApplication().render(true));

      html.find('.directory-header').append(button);
    }
  });
}
