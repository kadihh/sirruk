import { describe, it, expect } from 'vitest';
import { generatePassword } from '../generator';

const ALL_ON = { uppercase: true, lowercase: true, numbers: true, symbols: true };
const ALL_OFF = { uppercase: false, lowercase: false, numbers: false, symbols: false };

function charsInRange(str, min, max) {
  return [...str].every(c => {
    const code = c.charCodeAt(0);
    return code >= min && code <= max;
  });
}

describe('generatePassword', () => {
  it('returns a string of the requested length with all options on', () => {
    const pwd = generatePassword(16, ALL_ON);
    expect(pwd).toHaveLength(16);
  });

  it('returns a string of the requested length with one option on', () => {
    const pwd = generatePassword(24, { ...ALL_OFF, lowercase: true });
    expect(pwd).toHaveLength(24);
    expect(charsInRange(pwd, 97, 122)).toBe(true);
  });

  it('includes at least one uppercase char when uppercase is enabled', () => {
    const pwd = generatePassword(20, { ...ALL_OFF, uppercase: true });
    expect(pwd).toMatch(/[A-Z]/);
  });

  it('includes at least one lowercase char when lowercase is enabled', () => {
    const pwd = generatePassword(20, { ...ALL_OFF, lowercase: true });
    expect(pwd).toMatch(/[a-z]/);
  });

  it('includes at least one digit when numbers is enabled', () => {
    const pwd = generatePassword(20, { ...ALL_OFF, numbers: true });
    expect(pwd).toMatch(/[0-9]/);
  });

  it('includes at least one symbol when symbols is enabled', () => {
    const pwd = generatePassword(20, { ...ALL_OFF, symbols: true });
    expect(pwd).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
  });

  it('contains only characters from enabled sets with uppercase only', () => {
    const pwd = generatePassword(32, { ...ALL_OFF, uppercase: true });
    expect(pwd).toHaveLength(32);
    expect(charsInRange(pwd, 65, 90)).toBe(true);
  });

  it('contains only characters from enabled sets with digits only', () => {
    const pwd = generatePassword(16, { ...ALL_OFF, numbers: true });
    expect(pwd).toHaveLength(16);
    expect(charsInRange(pwd, 48, 57)).toBe(true);
  });

  it('returns empty string when no character sets are enabled', () => {
    expect(generatePassword(16, ALL_OFF)).toBe('');
  });

  it('handles short length with all options on (length < num sets)', () => {
    const pwd = generatePassword(2, ALL_ON);
    expect(pwd).toHaveLength(4);
  });

  it('handles length 8 with all options', () => {
    const pwd = generatePassword(8, ALL_ON);
    expect(pwd).toHaveLength(8);
  });

  it('handles length 64 with all options', () => {
    const pwd = generatePassword(64, ALL_ON);
    expect(pwd).toHaveLength(64);
  });

  describe('property-based invariants', () => {
    const ENABLED_SETS = [
      { options: { ...ALL_OFF, uppercase: true }, pool: /^[A-Z]+$/ },
      { options: { ...ALL_OFF, lowercase: true }, pool: /^[a-z]+$/ },
      { options: { ...ALL_OFF, numbers: true }, pool: /^[0-9]+$/ },
      { options: { ...ALL_OFF, symbols: true }, pool: /^[!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/ },
      { options: ALL_ON, pool: /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/ },
    ];

    for (const { options, pool } of ENABLED_SETS) {
      it(`output matches enabled character pool (${JSON.stringify(options)})`, () => {
        for (let i = 0; i < 50; i++) {
          const pwd = generatePassword(32, options);
          expect(pwd).toMatch(pool);
        }
      });
    }

    it('output length >= number of enabled character sets', () => {
      for (let i = 0; i < 50; i++) {
        const pwd = generatePassword(4, ALL_ON);
        expect(pwd.length).toBeGreaterThanOrEqual(4);
      }
    });

    it('every enabled set has at least one representative', () => {
      for (let i = 0; i < 50; i++) {
        const pwd = generatePassword(32, ALL_ON);
        expect(pwd).toMatch(/[A-Z]/);
        expect(pwd).toMatch(/[a-z]/);
        expect(pwd).toMatch(/[0-9]/);
        expect(pwd).toMatch(/[^A-Za-z0-9]/);
      }
    });
  });
});
