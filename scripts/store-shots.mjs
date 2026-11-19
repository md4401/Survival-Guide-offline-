// Store screenshots (phone 360x740 @3x) from the built app: node scripts/store-shots.mjs  (needs `npm run build`; uses the sandbox Chromium)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH ?? 'playwright');
const PORT = 4190; const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const srv = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const SHOTS = [['home', ''], ['triage', 'triage'], ['guide', 'guide/water.diy-filter'], ['emergency', 'emergency'], ['kit', 'prepare/kit/72h'], ['score', 'prepare/score'], ['sun', 'world/sun'], ['countries', 'world/countries'], ['morse', 'tools/morse']];
try {
  await wait(2500);
  const b = await chromium.launch();
  for (const lang of ['en', 'pt', 'ar']) {
    const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 3, locale: lang, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(`http://localhost:${PORT}/#/settings`); await p.waitForSelector('select'); await p.selectOption('select', lang);
    fs.mkdirSync(`store/${lang}`, { recursive: true });
    for (const [name, route] of SHOTS) {
      await p.goto(`http://localhost:${PORT}/#/${route}`); await p.waitForSelector('main'); await wait(700);
      await p.screenshot({ path: `store/${lang}/${name}.png` });
    }
    await ctx.close();
  }
  await b.close(); console.log('screenshots written to store/');
} finally { srv.kill(); }
