import {
  createCompendiumFromVetoolsBeastiary,
  VetoolsMonsterImportConfig,
} from '../importers/vetools-monsters-importer';

// #todo Add code documentation everywhere here and in vetools-monsters.js

/**
 * 5etools monster importer form application.
 * @extends {FormApplication}
 */
class VetoolsMonsterImporterApplication extends FormApplication {
  constructor() {
    const defaultConfig = new VetoolsMonsterImportConfig();

    let data = {
      compendiumName: '',
      vetoolsMonsterUrl: '',
      crScale: defaultConfig.crScale,
      profScale: defaultConfig.profScale,
      hpScale: defaultConfig.hpScale,
      acScale: defaultConfig.acScale,
      hitScale: defaultConfig.hitScale,
      damageScale: defaultConfig.damageScale,
      guaranteedWoundRatio: defaultConfig.guaranteedWoundRatio,
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
      progress[0].style.opacity = 0;
      importButton[0].disabled = false;
    } else {
      // Show the progress bar and disable the import button if it is not done importing.
      progress[0].style.opacity = 1;
      importButton[0].disabled = true;
    }
  }

  async _updateObject(_event, formData) {
    let vetoolsMonsterImportConfig = new VetoolsMonsterImportConfig();
    vetoolsMonsterImportConfig.crScale = formData.crScale;
    vetoolsMonsterImportConfig.profScale = formData.profScale;
    vetoolsMonsterImportConfig.hpScale = formData.hpScale;
    vetoolsMonsterImportConfig.acScale = formData.acScale;
    vetoolsMonsterImportConfig.hitScale = formData.hitScale;
    vetoolsMonsterImportConfig.damageScale = formData.damageScale;
    vetoolsMonsterImportConfig.guaranteedWoundRatio = formData.guaranteedWoundRatio;

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
