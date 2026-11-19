// "Report an error" works offline: reports are stored on the device. Nothing is sent unless an endpoint is configured AND the user allows it.
import { getKV, setKV } from '../db/dexie';

export interface Report { id: string; guideId: string; lang: string; text: string; at: number; sent: boolean }
const KEY = 'reports';
export const REPORT_ENDPOINT: string | null = null; // no server in the MVP

export const listReports = () => getKV<Report[]>(KEY, []);
export async function addReport(r: Omit<Report, 'id' | 'at' | 'sent'>, now = Date.now()): Promise<Report> {
  const rep: Report = { ...r, text: r.text.trim(), id: `${now}-${Math.random().toString(36).slice(2, 7)}`, at: now, sent: false };
  await setKV(KEY, [rep, ...(await listReports())]); return rep;
}
export async function removeReport(id: string) { await setKV(KEY, (await listReports()).filter((r) => r.id !== id)); }
export const reportsText = (rs: Report[]) => rs.map((r) => `[${new Date(r.at).toISOString()}] ${r.guideId} (${r.lang}): ${r.text}`).join('\n');
/** Sends pending reports only if online, an endpoint exists and the user consented. Failures keep them queued. */
export async function flushReports(o: { endpoint: string | null; consent: boolean; online: boolean; fetchFn?: typeof fetch }): Promise<number> {
  if (!o.endpoint || !o.consent || !o.online) return 0;
  const f = o.fetchFn ?? fetch; const all = await listReports(); let n = 0;
  for (const r of all.filter((x) => !x.sent)) {
    try { const res = await f(o.endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ guideId: r.guideId, lang: r.lang, text: r.text, at: r.at }) }); if (res.ok) { r.sent = true; n++; } } catch { break; }
  }
  await setKV(KEY, all); return n;
}
