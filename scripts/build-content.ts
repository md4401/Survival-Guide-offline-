import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadRaw, toGuide, LANGS, ROOT } from './lib/content';

const out = path.join(ROOT, 'src/generated');
fs.mkdirSync(out, { recursive: true });
const version = new Date().toISOString().slice(0, 10);
const manifest: Record<string, any> = { version, packs: {} };
for (const lang of LANGS) {
  const guides = loadRaw(lang).map(toGuide).sort((a, b) => a.id.localeCompare(b.id));
  const json = JSON.stringify({ lang, version, guides });
  fs.writeFileSync(path.join(out, `content.${lang}.json`), json);
  manifest.packs[lang] = {
    bytes: Buffer.byteLength(json), guides: guides.length,
    sha256: crypto.createHash('sha256').update(json).digest('hex'),
  };
}
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✓ content packs built', manifest.packs);
