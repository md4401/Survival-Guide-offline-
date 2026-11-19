// Model manager: opt-in download, progress, cancel/resume (file-level), delete. Everything runs on the device; the only network use is the download itself.
import { getKV, setKV } from '../db/dexie';
import { HF_API, RUNTIME_URLS, type ModelInfo } from './models';

export interface AiState { installed: Record<string, { repo: string; label: string; at: number; dtype: string }>; active: string | null; enabledInCrisis: boolean }
const DEFAULT: AiState = { installed: {}, active: null, enabledInCrisis: false };
export const loadAi = async () => ({ ...DEFAULT, ...(await getKV<Partial<AiState>>('ai', {})) });
export const saveAi = (s: AiState) => setKV('ai', s);

export interface Progress { loaded: number; total: number; file?: string }
export class Cancelled extends Error {}

let tf: any = null;
/** Test hook: inject a fake runtime instead of loading the CDN bundle. */
export const __setRuntime = (x: any) => { tf = x; engineCache.clear(); };
/** Short, readable reason for a failure, for the screen. */
export const errText = (e: unknown) => { const x = e as { name?: string; message?: string }; return `${x?.name && x.name !== 'Error' ? x.name + ': ' : ''}${String(x?.message ?? e)}`.replace(/\s+/g, ' ').slice(0, 240); };
/** Imports a module directly, or (if the WebView refuses a cross-origin import) by fetching the text and importing it from a blob. */
async function importModule(url: string): Promise<any> {
  try { return await import(/* @vite-ignore */ url); }
  catch (direct) {
    try {
      const r = await fetch(url); if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = URL.createObjectURL(new Blob([await r.text()], { type: 'text/javascript' }));
      try { return await import(/* @vite-ignore */ blob); } finally { URL.revokeObjectURL(blob); }
    } catch (viaBlob) { throw new Error(`${errText(direct)} | ${errText(viaBlob)}`); }
  }
}
/** Loads the pinned runtime from a CDN on first use (cached by the service worker for offline use afterwards); tries each mirror in turn. */
export async function runtime(): Promise<any> {
  if (!tf) {
    const errors: string[] = [];
    for (const url of RUNTIME_URLS) {
      try {
        const lib = await importModule(url);
        lib.env.allowLocalModels = false; lib.env.useBrowserCache = true;
        try { lib.env.backends.onnx.wasm.wasmPaths = url.replace(/[^/]*$/, ''); } catch { /* keep the library default */ }
        tf = lib; break;
      } catch (e) { errors.push(`${new URL(url).host}: ${errText(e)}`); }
    }
    if (!tf) throw new Error(`runtime: ${errors.join(' || ')}`);
  }
  return tf;
}

export interface HostCheck { host: string; ok: boolean; detail: string }
/** Checks that each host the download needs can be reached from this device (so a blocked network or DNS shows up clearly). */
export async function testConnection(fetchFn: typeof fetch = fetch): Promise<HostCheck[]> {
  const targets = [`${HF_API}HuggingFaceTB/SmolLM2-360M-Instruct`, ...RUNTIME_URLS];
  return Promise.all(targets.map(async (url) => {
    const host = new URL(url).host;
    try {
      const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 10000);
      const r = await fetchFn(url, { method: 'GET', cache: 'no-store', signal: ctl.signal }); clearTimeout(timer);
      return { host, ok: r.ok, detail: `HTTP ${r.status}` };
    } catch (e) { return { host, ok: false, detail: errText(e) }; }
  }));
}

export interface Precheck { ok: boolean; reason?: 'offline' | 'not-found' | 'gated' | 'space' | 'network'; bytes?: number; gated?: boolean }
/** Looks the repo up on Hugging Face (existence, gated flag, size of the files we'd download) and checks free space. */
export async function precheck(m: ModelInfo): Promise<Precheck> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { ok: false, reason: 'offline' };
  let bytes = m.approxMB * 1048576; let gated = false;
  try {
    const r = await fetch(`${HF_API}${m.repo}?blobs=true`);
    if (r.status === 404) return { ok: false, reason: 'not-found' };
    if (r.status === 401 || r.status === 403) return { ok: false, reason: 'gated' };
    if (r.ok) {
      const j = await r.json(); gated = !!j.gated;
      const files: Array<{ rfilename: string; size?: number }> = j.siblings ?? [];
      const sum = files.filter((f) => !f.rfilename.startsWith('onnx/') || f.rfilename.includes(`model_${m.dtype}.onnx`)).reduce((n, f) => n + (f.size ?? 0), 0);
      if (sum > 0) bytes = sum;
    }
  } catch { return { ok: false, reason: 'network' }; }
  try {
    const est = await navigator.storage?.estimate?.();
    if (est?.quota != null && est.usage != null && est.quota - est.usage < bytes * 1.2) return { ok: false, reason: 'space', bytes };
  } catch { /* unknown quota */ }
  return { ok: true, bytes, gated };
}

/** Downloads (and warms) the model. Files already cached are skipped, so retrying after cancel/failure resumes. */
export async function download(m: ModelInfo, onProgress: (p: Progress) => void, shouldCancel: () => boolean): Promise<void> {
  const lib = await runtime();
  try { await navigator.storage?.persist?.(); } catch { /* optional */ }
  const files = new Map<string, { loaded: number; total: number }>();
  const gen = await lib.pipeline('text-generation', m.repo, {
    dtype: m.dtype, device: 'wasm',
    progress_callback: (p: any) => {
      if (shouldCancel()) throw new Cancelled();
      if (p.status === 'progress' && p.total) {
        files.set(p.file, { loaded: p.loaded, total: p.total });
        const all = [...files.values()];
        onProgress({ loaded: all.reduce((n, f) => n + f.loaded, 0), total: all.reduce((n, f) => n + f.total, 0), file: p.file });
      }
    },
  });
  engineCache.set(m.repo, gen);
  const s = await loadAi();
  s.installed[m.id] = { repo: m.repo, label: m.label, at: Date.now(), dtype: m.dtype };
  s.active ??= m.id;
  await saveAi(s);
}

export async function remove(m: { id: string; repo: string }): Promise<void> {
  engineCache.delete(m.repo);
  try {
    for (const name of await caches.keys()) {
      if (!/transformers/i.test(name)) continue;
      const c = await caches.open(name);
      for (const req of await c.keys()) if (req.url.includes(`/${m.repo}/`)) await c.delete(req);
    }
  } catch { /* cache API unavailable */ }
  const s = await loadAi(); delete s.installed[m.id];
  if (s.active === m.id) s.active = Object.keys(s.installed)[0] ?? null;
  await saveAi(s);
}

const engineCache = new Map<string, any>();
export async function getGenerator(m: { repo: string; dtype: string; qwen3?: boolean }) {
  if (engineCache.has(m.repo)) return engineCache.get(m.repo);
  const lib = await runtime();
  const device = (navigator as any).gpu ? 'webgpu' : 'wasm';
  let gen;
  try { gen = await lib.pipeline('text-generation', m.repo, { dtype: m.dtype, device }); }
  catch { gen = await lib.pipeline('text-generation', m.repo, { dtype: m.dtype, device: 'wasm' }); }
  engineCache.set(m.repo, gen); return gen;
}
/** Streams a reply from the installed model (max ~320 new tokens, greedy decoding). */
export async function generate(m: { repo: string; dtype: string; qwen3?: boolean }, messages: Array<{ role: string; content: string }>, onToken: (t: string) => void): Promise<string> {
  const lib = await runtime(); const gen = await getGenerator(m);
  let acc = '';
  const streamer = new lib.TextStreamer(gen.tokenizer, { skip_prompt: true, skip_special_tokens: true, callback_function: (t: string) => { acc += t; onToken(t); } });
  const out = await gen(messages, { max_new_tokens: 320, do_sample: false, streamer });
  const last = out?.[0]?.generated_text; const text = Array.isArray(last) ? last.at(-1)?.content : last;
  return typeof text === 'string' && text ? text : acc;
}
