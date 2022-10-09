export function secureRandomNumber(zeroUpToExclusive) {
  const randomValue = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return Math.floor((randomValue / 2 ** 32) * zeroUpToExclusive);
}

export function makeRng(...constNumber) {
  return () => {
    const result = constNumber.shift();
    if (result === undefined) {
      throw new Error('out of entropy');
    } else {
      return result;
    }
  };
}

export function getDieImage(images, die, face) {
  const dieImages = images.get(die);
  if (dieImages !== undefined) {
    const image = dieImages.get(face);
    if (image !== undefined) {
      return image;
    } else {
      throw new Error(`Unknown face ${face}`);
    }
  } else {
    throw new Error(`Unknown die ${die}`);
  }
}

export function countMatches(array, match) {
  let count = 0;
  for (const elem of array) {
    if (match(elem)) {
      count += 1;
    }
  }
  return count;
}

export function escapeHtml(value) {
  const text = document.createTextNode(value);
  const p = document.createElement('p');
  p.appendChild(text);
  return p.innerHTML;
}

export function combineAll(values, monoid) {
  return values.reduce((prev, curr) => monoid.combine(prev, curr), monoid.identity);
}
