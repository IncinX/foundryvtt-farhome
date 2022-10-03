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

      button.on('click', () => console.log('Launch Farhome Rules Importer Application'));

      html.find('.directory-header').append(button);

      /* Old code to reference
      let button = $('<button class='import-dd'><i class='fas fa-file-import'></i> Universal Battlemap Import</button>')
  
      button.click(function () {
        new DDImporter().render(true);
      });
  
      html.find('.directory-header').append(button);
      */
    }
  });
}
