// #todo Create auto helper methods to go into template and add a derived label field that auto-resolves localization to farhome.<field_name>
//       Basically if something is of type "object" then it will add a label field and attempt to localize it with defaulting to the original name on fallback and logging a warning to console.

export default class FarhomeActorSheet extends ActorSheet {
  get template() {
    return `systems/farhome/templates/sheets/${this.actor.data.type}-sheet.hbs`;
  }

  getData() {
    // #todo This is jank, does it need to be like this?
    const data = super.getData();
    const itemData = data.data;

    data.config = CONFIG.farhome;

    data.item = itemData;
    data.data = itemData.data;
    return data;
  }
}
