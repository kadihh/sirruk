import { describe, it, expect } from 'vitest';
import { cryptoRandomInt } from '../crypto';

describe('cryptoRandomInt', () => {
  it('returns a number in [0, max)', () => {
    for (const max of [2, 10, 26, 52, 100]) {
      for (let i = 0; i < 100; i++) {
        const result = cryptoRandomInt(max);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(max);
      }
    }
  });

  it('returns 0 when max is 1', () => {
    for (let i = 0; i < 100; i++) {
      expect(cryptoRandomInt(1)).toBe(0);
    }
  });

  it('produces varying results across calls', () => {
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      results.add(cryptoRandomInt(100));
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it('never returns NaN', () => {
    for (let i = 0; i < 100; i++) {
      expect(Number.isNaN(cryptoRandomInt(26))).toBe(false);
    }
  });

  it('throws RangeError for max <= 0', () => {
    expect(() => cryptoRandomInt(0)).toThrow(RangeError);
    expect(() => cryptoRandomInt(-1)).toThrow(RangeError);
  });

  it('throws RangeError for non-integer max', () => {
    expect(() => cryptoRandomInt(1.5)).toThrow(RangeError);
    expect(() => cryptoRandomInt(NaN)).toThrow(RangeError);
  });

  it('has uniform distribution over many calls', () => {
    const counts = new Array(5).fill(0);
    const total = 5000;
    for (let i = 0; i < total; i++) {
      counts[cryptoRandomInt(5)]++;
    }
    for (const count of counts) {
      expect(count).toBeGreaterThan(total / 5 * 0.85);
      expect(count).toBeLessThan(total / 5 * 1.15);
    }
  });
});
