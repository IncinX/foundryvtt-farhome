/**
 * Get a value from an object by a path.
 * @param {Object} object The object to get the value from.
 * @param {String} objectPath The path to the value.
 * @returns The value at the path.
 * @example
 * const object = {
 *  a: {
 *   b: {
 *   c: 1
 *  }
 * }
 * };
 * const value = getByObjectPath(object, 'a.b.c');
 * console.log(value); // 1
 */
export function getByObjectPath(object, objectPath) {
  return objectPath.split('.').reduce((o, i) => o[i], object);
}
