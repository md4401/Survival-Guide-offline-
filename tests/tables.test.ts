import { describe, it, expect } from 'vitest';
import { BEAUFORT, SAFFIR, toRoman } from '../src/data/tables';

describe('tables', () => {
  it('roman numerals', () => {
    expect([1, 4, 9, 14, 40, 90, 400, 1994, 2024, 3999].map(toRoman)).toEqual(['I', 'IV', 'IX', 'XIV', 'XL', 'XC', 'CD', 'MCMXCIV', 'MMXXIV', 'MMMCMXCIX']);
    expect(toRoman(0)).toBe(''); expect(toRoman(4000)).toBe('');
  });
  it('Beaufort and Saffir ranges are contiguous', () => {
    for (let i = 1; i < BEAUFORT.length; i++) expect(BEAUFORT[i][0]).toBe((BEAUFORT[i - 1][1] as number) + 1);
    for (let i = 1; i < SAFFIR.length; i++) expect(SAFFIR[i][0]).toBe((SAFFIR[i - 1][1] as number) + 1);
    expect(BEAUFORT).toHaveLength(13);
  });
});
