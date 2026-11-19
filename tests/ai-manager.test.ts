import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { __setRuntime, download, generate, loadAi, remove, Cancelled } from '../src/ai/manager';
import { MODELS } from '../src/ai/models';

const m = MODELS.find((x) => x.id === 'qwen3-0.6b')!;
function fakeRuntime(opts: { files?: number } = {}) {
  return {
    env: {},
    async pipeline(_task: string, repo: string, o: any) {
      const n = opts.files ?? 3;
      for (let i = 1; i <= n; i++) o.progress_callback?.({ status: 'progress', file: `f${i}`, loaded: 50, total: 100 });
      for (let i = 1; i <= n; i++) o.progress_callback?.({ status: 'progress', file: `f${i}`, loaded: 100, total: 100 });
      const gen: any = async (_msgs: any, g: any) => { for (const t of ['Boil ', 'for 1 ', 'minute [water.diy-filter]']) g.streamer.cb(t); return [{ generated_text: [{ role: 'assistant', content: 'Boil for 1 minute [water.diy-filter]' }] }]; };
      gen.tokenizer = { repo };
      return gen;
    },
    TextStreamer: class { cb: (t: string) => void; constructor(_tok: any, o: any) { this.cb = o.callback_function; (this as any).callback_function = o.callback_function; } },
  };
}

describe('model manager (fake runtime)', () => {
  it('downloads, reports aggregate progress, records the model as installed and active', async () => {
    __setRuntime(fakeRuntime());
    const seen: number[] = [];
    await download(m, (p) => seen.push(p.loaded / p.total), () => false);
    expect(Math.max(...seen)).toBe(1);
    const st = await loadAi();
    expect(st.installed[m.id].repo).toBe(m.repo); expect(st.active).toBe(m.id);
  });
  it('streams tokens and returns the final text', async () => {
    __setRuntime(fakeRuntime());
    const toks: string[] = [];
    const out = await generate(m, [{ role: 'user', content: 'x' }], (t) => toks.push(t));
    expect(out).toBe('Boil for 1 minute [water.diy-filter]'); expect(toks.join('')).toBe('Boil for 1 minute [water.diy-filter]');
  });
  it('cancel aborts the download and leaves nothing installed', async () => {
    await remove(m);
    __setRuntime(fakeRuntime());
    await expect(download(m, () => {}, () => true)).rejects.toBeInstanceOf(Cancelled);
    expect((await loadAi()).installed[m.id]).toBeUndefined();
  });
  it('remove deletes the model and clears active', async () => {
    __setRuntime(fakeRuntime()); await download(m, () => {}, () => false);
    await remove(m);
    const st = await loadAi(); expect(st.installed[m.id]).toBeUndefined(); expect(st.active).toBeNull();
  });
});
