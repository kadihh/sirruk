export function cryptoRandomInt(max) {
  const array = new Uint32Array(1);
  const maxValid = 0xFFFFFFFF - (0xFFFFFFFF % max);
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= maxValid);
  return array[0] % max;
}
