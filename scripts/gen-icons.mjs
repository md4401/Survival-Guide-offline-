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
// Android launcher icons (adaptive foreground + legacy) into the Capacitor project, if it exists
if (fs.existsSync('android/app/src/main/res')) {
  const fg = fs.readFileSync('public/icon-fg.svg', 'utf8');
  const D = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(D)) {
    const dir = `android/app/src/main/res/mipmap-${d}`; fs.mkdirSync(dir, { recursive: true });
    const fgSize = Math.round(108 * k), icon = Math.round(48 * k);
    await p.setViewportSize({ width: fgSize, height: fgSize });
    await p.setContent(`<body style="margin:0;background:transparent">${fg.replace('<svg ', '<svg width="100%" height="100%" ')}</body>`);
    await p.screenshot({ path: `${dir}/ic_launcher_foreground.png`, omitBackground: true });
    for (const [name, radius] of [['ic_launcher.png', '18%'], ['ic_launcher_round.png', '50%']]) {
      await p.setViewportSize({ width: icon, height: icon });
      await p.setContent(`<body style="margin:0;background:transparent"><div style="width:${icon}px;height:${icon}px;border-radius:${radius};overflow:hidden;background:#0f1417"><div style="width:${icon}px;height:${icon}px;transform:scale(1.35)">${fg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></div></body>`);
      await p.screenshot({ path: `${dir}/${name}`, omitBackground: true });
    }
  }
}
await b.close(); console.log('icons written');
