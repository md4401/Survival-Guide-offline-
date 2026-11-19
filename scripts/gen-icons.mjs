// Renders public/icon.svg to PNG (any + maskable) with the sandbox Chromium. Run: node scripts/gen-icons.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH ?? 'playwright');
const svg = fs.readFileSync('public/icon.svg', 'utf8');
const b = await chromium.launch(); const p = await b.newPage();
for (const [name, size, pad] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 0.12]]) {
  await p.setViewportSize({ width: size, height: size });
  const inner = Math.round(size * (1 - pad * 2)), off = Math.round(size * pad);
  await p.setContent(`<body style="margin:0;background:#0f1417"><div style="position:absolute;left:${off}px;top:${off}px;width:${inner}px;height:${inner}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body>`);
  await p.screenshot({ path: `public/${name}` });
}
await b.close(); console.log('icons written');
