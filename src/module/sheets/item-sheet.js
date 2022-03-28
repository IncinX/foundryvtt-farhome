export default class FarhomeItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 600,
      classes: ['farhome', 'sheet', 'item'],
    });
  }

  get template() {
    return `systems/farhome/templates/sheets/${this.item.data.type}-sheet.html`;
  }

  getData() {
    const data = super.getData();
    const itemData = data.data;

    data.config = CONFIG.farhome;

    data.item = itemData;
    data.data = itemData.data;
    return data;
  }
}
