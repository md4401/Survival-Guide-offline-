import { describe, it, expect } from 'vitest';
import { translate, LOCALES } from '../src/i18n';

describe('i18n', () => {
  it('en and pt have identical keys', () => {
    expect(Object.keys(LOCALES.pt).sort()).toEqual(Object.keys(LOCALES.en).sort());
  });
  it('falls back to English for stub locales, never to an empty string', () => {
    expect(translate('ar', 'nav.home')).toBe(LOCALES.en['nav.home']);
  });
  it('interpolates params', () => {
    expect(translate('en', 'common.minutes', { n: 5 })).toBe('5 min');
  });
  it('returns the key if missing everywhere', () => {
    expect(translate('pt', 'no.such.key')).toBe('no.such.key');
  });
});
