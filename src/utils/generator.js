import { cryptoRandomInt } from './crypto.js';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_SYMBOLS = new Set('|;'.split(''));

export function generatePassword(length, options) {
  let pool = '';
  const required = [];
  const symbols = options.excludeAmbiguous
    ? [...SYMBOLS].filter(c => !AMBIGUOUS_SYMBOLS.has(c)).join('')
    : SYMBOLS;

  if (options.uppercase) { pool += UPPER; required.push(UPPER[cryptoRandomInt(UPPER.length)]); }
  if (options.lowercase) { pool += LOWER; required.push(LOWER[cryptoRandomInt(LOWER.length)]); }
  if (options.numbers) { pool += DIGITS; required.push(DIGITS[cryptoRandomInt(DIGITS.length)]); }
  if (options.symbols) { pool += symbols; required.push(symbols[cryptoRandomInt(symbols.length)]); }

  if (pool.length === 0) return '';
  const result = [];

  for (const char of required) result.push(char);
  for (let i = 0; i < length - required.length; i++) {
    result.push(pool[cryptoRandomInt(pool.length)]);
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}
