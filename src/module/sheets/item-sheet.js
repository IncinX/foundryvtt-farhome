export default class FarhomeItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 560,
      height: 400,
      classes: ['farhome', 'sheet', 'item'],
    });
  }

  get template() {
    return `systems/farhome/templates/sheets/${this.item.data.type}-sheet.hbs`;
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
