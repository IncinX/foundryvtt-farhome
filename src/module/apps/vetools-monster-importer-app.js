import { createCompendiumFromVetoolsBeastiary, VetoolsMonsterImportConfig } from '../importers/vetools-monsters';

// #todo Add code documentation everywhere here and in vetools-monsters.js

/**
 * 5etools monster importer form application.
 * @extends {FormApplication}
 */
class VetoolsMonsterImporterApplication extends FormApplication {
  constructor(object, options) {
    super(object, options);

    this.data = {};
    this.data.compendiumName = '';
    this.data.vetoolsMonsterUrl = '';
    this.data.hpScale = 0.3;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      template: `systems/farhome/templates/apps/vetools-monster-importer-app.hbs`,
      id: 'vetools-monster-importer',
      title: '5etools Monster Importer',
    });
  }

  getData() {
    // Send data to the template
    return this.data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    $(html).find('button[id="import"]').on('click', this._onImport.bind(this));
  }

  _onImport(event) {
    console.log(this.data);
  }

  async _updateObject(_event, _formData) {
    console.log(_formData);
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
