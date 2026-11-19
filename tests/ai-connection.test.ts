import { describe, it, expect } from 'vitest';
import { testConnection, errText } from '../src/ai/manager';
import { RUNTIME_URLS } from '../src/ai/models';
describe('model download diagnostics', () => {
  it('reports each host separately (ok, HTTP error, network failure)', async () => {
    const f = (async (url: string) => { if (url.includes('huggingface.co')) return { ok: true, status: 200 }; if (url.includes('jsdelivr')) return { ok: false, status: 503 }; throw new TypeError('Failed to fetch'); }) as unknown as typeof fetch;
    const r = await testConnection(f); expect(r.map((x) => [x.host, x.ok])).toEqual([['huggingface.co', true], ['cdn.jsdelivr.net', false], ['unpkg.com', false]]);
    expect(r[1].detail).toBe('HTTP 503'); expect(r[2].detail).toContain('Failed to fetch');
  });
  it('has a second runtime mirror and short readable errors', () => {
    expect(RUNTIME_URLS.length).toBeGreaterThanOrEqual(2); expect(errText(new TypeError('x'.repeat(500))).length).toBeLessThanOrEqual(240); expect(errText(new Error('boom'))).toBe('boom'); expect(errText('plain')).toBe('plain');
  });
});
