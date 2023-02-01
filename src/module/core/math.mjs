/**
 * Smart clamp function that returns the clamped value of num between min and max.
 * If min or max is undefined, it will not clamp to that value.
 * @param {*} num The number to clamp.
 * @param {*} min Minimum number to clamp to, or undefined.
 * @param {*} max Maximum number to clamp to, or undefined.
 * @returns The original number value that is clamped between min and max (if provided).
 */
export function clamp(num, min, max) {
  if (min === undefined && max === undefined) {
    return num;
  } else if (min === undefined) {
    return Math.min(num, max);
  } else if (max === undefined) {
    return Math.max(num, min);
  } else {
    return Math.min(Math.max(num, min), max);
  }
}
