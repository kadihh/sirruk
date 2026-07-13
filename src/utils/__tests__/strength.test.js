import { describe, it, expect } from 'vitest';
import { LEVELS, getActiveLevel, calculatePasswordStrength, estimateCrackTime } from '../strength';

describe('LEVELS', () => {
  it('has 4 levels sorted by min ascending', () => {
    expect(LEVELS).toHaveLength(4);
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].min).toBeGreaterThan(LEVELS[i - 1].min);
    }
  });

  it('starts at min 0', () => {
    expect(LEVELS[0].min).toBe(0);
  });
});

describe('getActiveLevel', () => {
  it('returns -1 for score below all thresholds', () => {
    expect(getActiveLevel(-1)).toBe(-1);
  });

  it('returns correct level index for each threshold', () => {
    expect(getActiveLevel(0)).toBe(0);
    expect(getActiveLevel(28)).toBe(0);
    expect(getActiveLevel(29)).toBe(1);
    expect(getActiveLevel(35)).toBe(1);
    expect(getActiveLevel(36)).toBe(2);
    expect(getActiveLevel(59)).toBe(2);
    expect(getActiveLevel(60)).toBe(3);
    expect(getActiveLevel(100)).toBe(3);
  });
});

describe('calculatePasswordStrength', () => {
  it('returns 0 entropy for empty password', () => {
    const result = calculatePasswordStrength('');
    expect(result.entropy).toBe(0);
    expect(result.label).toBe('Weak');
  });

  it('calculates entropy for lowercase only', () => {
    const result = calculatePasswordStrength('abcdefgh');
    expect(result.entropy).toBe(38);
  });

  it('calculates entropy for mixed case', () => {
    const result = calculatePasswordStrength('abcdefghABCD');
    expect(result.entropy).toBe(68);
  });

  it('calculates entropy for all character classes', () => {
    const result = calculatePasswordStrength('abcdefghABCD1234!@#$');
    expect(result.entropy).toBe(130);
  });

  it('caps entropy label at Very Strong', () => {
    const long = 'a'.repeat(32);
    const result = calculatePasswordStrength(long);
    expect(result.label).toBe('Very Strong');
  });
});

describe('estimateCrackTime', () => {
  it('returns instant for 0 entropy', () => {
    expect(estimateCrackTime(0)).toBe('instant');
  });

  it('returns reasonable time for moderate entropy', () => {
    const time = estimateCrackTime(65);
    expect(time).toMatch(/years/);
  });

  it('returns very large time for strong entropy', () => {
    const time = estimateCrackTime(60);
    expect(time).toMatch(/years/);
  });

  it('returns huge time for very high entropy', () => {
    const time = estimateCrackTime(88);
    expect(time).toMatch(/years/);
  });
});
