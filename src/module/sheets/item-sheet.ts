export default class FarhomeItemSheet extends ItemSheet {
    get template(): string {
        return `systems/farhome/templates/sheets/${this.item.data.type}-sheet.html`;
    }

    // @ts-ignore Not sure how to do this properly in Typescript yet
    getData() {
        let data = super.getData();

        // @ts-ignore Not sure how to do this properly in Typescript yet
        data.config = CONFIG.farhome;

        return data;
    }
}