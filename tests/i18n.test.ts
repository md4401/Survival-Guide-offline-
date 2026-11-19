import { describe, it, expect } from 'vitest';
import { translate, LOCALES } from '../src/i18n';

describe('i18n', () => {
  it('en and pt have identical keys', () => {
    expect(Object.keys(LOCALES.pt).sort()).toEqual(Object.keys(LOCALES.en).sort());
  });
  it('falls back to English for stub locales, never to an empty string', () => {
    expect(translate('ar', 'ai.eval.run')).toBe(LOCALES.en['ai.eval.run']);
    expect(translate('ar', 'nav.home')).not.toBe(LOCALES.en['nav.home']);
  });
  it('interpolates params', () => {
    expect(translate('en', 'common.minutes', { n: 5 })).toBe('5 min');
  });
  it('returns the key if missing everywhere', () => {
    expect(translate('pt', 'no.such.key')).toBe('no.such.key');
  });

  it('translated locales only use known keys and keep the same {placeholders}', () => {
    const ph = (x: string) => (x.match(/\{\w+\}/g) ?? []).sort().join();
    for (const l of ['es', 'fr', 'ar', 'hi', 'zh']) for (const [k, v] of Object.entries(LOCALES[l])) {
      expect(LOCALES.en[k], `${l}:${k}`).toBeDefined(); expect(ph(v), `${l}:${k}`).toBe(ph(LOCALES.en[k]));
    }
  });
  it('essential emergency path is translated in every language', () => {
    for (const l of ['es', 'fr', 'ar', 'hi', 'zh']) for (const k of ['home.help', 'triage.title', 'triage.opt.cpr', 'num.title', 'nav.emergency', 'guide.now']) expect(LOCALES[l][k], `${l}:${k}`).toBeTruthy();
  });
});
