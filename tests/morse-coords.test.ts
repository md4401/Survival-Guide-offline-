import { describe, it, expect } from 'vitest';
import { toMorse, morseTimeline, SOS } from '../src/lib/morse';
import { formatDms, formatDecimal, shareText } from '../src/lib/coords';

describe('morse', () => {
  it('encodes SOS', () => expect(toMorse('SOS')).toBe(SOS));
  it('strips accents and separates words', () => expect(toMorse('AÇÃO sim')).toBe('.- -.-. .- --- / ... .. --'));
  it('timeline uses 1/3/7 units', () => {
    expect(morseTimeline('.- / .')).toEqual([[true, 1], [false, 1], [true, 3], [false, 7], [true, 1]]);
  });
});
describe('coords', () => {
  const f = { lat: -23.55052, lon: -46.63331, accuracy: 12.4, time: Date.UTC(2026, 10, 19, 12, 30) };
  it('formats decimal and DMS', () => {
    expect(formatDecimal(f)).toBe('-23.55052, -46.63331');
    expect(formatDms(f)).toBe(`23°33'01.9"S 46°37'59.9"W`);
  });
  it('builds share text with UTC time', () => {
    expect(shareText(f, { lat: 'Lat', lon: 'Lon', acc: 'Acc', time: 'Time' })).toContain('Time: 2026-11-19 12:30 UTC');
  });
});
