import { createCompendiumFromVetoolsBeastiary, VetoolsMonsterImportConfig } from '../importers/vetools-monsters';

// #todo Add code documentation everywhere here and in vetools-monsters.js

/**
 * 5etools monster importer form application.
 * @extends {FormApplication}
 */
class VetoolsMonsterImporterApplication extends FormApplication {
  constructor() {
    let data = {
      compendiumName: '',
      vetoolsMonsterUrl: '',
      hpScale: 0.3,
    };

    super(data, {});
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      template: `systems/farhome/templates/apps/vetools-monster-importer-app.hbs`,
      id: 'vetools-monster-importer',
      title: '5etools Monster Importer',
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
      progress[0].style.display = 'none';
      importButton[0].disabled = false;
    } else {
      // Show the progress bar and disable the import button if it is not done importing.
      progress[0].style.display = 'block';
      importButton[0].disabled = true;
    }
  }

  async _updateObject(_event, formData) {
    console.log(formData);

    let vetoolsMonsterImportConfig = new VetoolsMonsterImportConfig();
    vetoolsMonsterImportConfig.hpScale = formData.hpScale;

    await createCompendiumFromVetoolsBeastiary(
      formData.vetoolsMonsterUrl,
      formData.compendiumName,
      vetoolsMonsterImportConfig,
      this._progressCallback.bind(this),
    );
  }
}

export function connectVetoolsMonsterImporterApp() {
  Hooks.on('renderSidebarTab', async (app, html) => {
    if (app.options.id == 'compendium') {
      // Only connect this if the user is the GM
      if (!game.user.isGM) return;

      let button = $(`
        <div class="header-actions action-buttons flexrow">
          <button class="import-farhome-rules">
            <i class="fas fa-file-import"></i> Import 5e Tools Monsters
          </button>
        </div>`);

      button.on('click', () => new VetoolsMonsterImporterApplication().render(true));

      html.find('.directory-header').append(button);
    }
  });
}
