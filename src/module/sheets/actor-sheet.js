export default class FarhomeItemSheet extends ItemSheet {
  get template() {
    return `systems/farhome/templates/sheets/${this.actor.data.type}-sheet.html`;
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
