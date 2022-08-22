export function combineAll(values, monoid) {
  return values.reduce((prev, curr) => monoid.combine(prev, curr), monoid.identity);
}

