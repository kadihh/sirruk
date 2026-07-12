export function cryptoRandomInt(max) {
  if (!Number.isInteger(max) || max <= 0) throw new RangeError('max must be a positive integer');
  const array = new Uint32Array(1);
  const maxValid = 0xFFFFFFFF - (0xFFFFFFFF % max);
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= maxValid);
  return array[0] % max;
}
