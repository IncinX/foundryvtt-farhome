/**
 * Recursively localizes an object by adding a label sub-key with the localization of it's key name.
 *
 * @param {Object} object Any javascript object
 *
 * @return {undefined}
 */

export function localizeObject(objectKeyName, objectValue) {
  let hasLabel = false;

  if (objectValue === null) {
    return;
  }

  for (let [k, v] of Object.entries(objectValue)) {
    if (k === 'label') {
      console.warn(`Label field already found for key: ${objectKeyName}`);
      hasLabel = true;
    } else if (k !== 'value' && typeof v === 'object') {
      localizeObject(k, v);
    }
  }

  if (objectKeyName !== null && !hasLabel) {
    let localizationKey = `farhome.${objectKeyName}`;
    let labelText = game.i18n.localize(localizationKey);

    if (labelText === localizationKey) {
      console.warn(`Localization not found: farhome.${objectKeyName}`);
    }

    objectValue.label = labelText;
  }
}
