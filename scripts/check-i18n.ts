// Enforces: en/pt have identical keys; every t('key') used in src exists in en; no hard-coded text in TSX.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/content';

const load = (l: string) => JSON.parse(fs.readFileSync(path.join(ROOT, `src/i18n/locales/${l}.json`), 'utf8')) as Record<string, string>;
const en = load('en'), pt = load('pt');
const errors: string[] = [];
for (const k of Object.keys(en)) if (!(k in pt)) errors.push(`pt missing key: ${k}`);
for (const k of Object.keys(pt)) if (!(k in en)) errors.push(`en missing key: ${k}`);

function files(d: string): string[] {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? (e.name === 'generated' ? [] : files(p)) : /\.tsx?$/.test(e.name) ? [p] : [];
  });
}
for (const f of files(path.join(ROOT, 'src'))) {
  const src = fs.readFileSync(f, 'utf8');
  const rel = path.relative(ROOT, f);
  for (const m of src.matchAll(/\bt\(\s*['"]([\w.\-]+)['"]/g)) if (!(m[1] in en)) errors.push(`${rel}: unknown key ${m[1]}`);
  if (f.endsWith('.tsx')) {
    // literal text between JSX tags, e.g. <p>Hello</p>
    for (const m of src.matchAll(/>\s*([A-Za-zÀ-ÿ][^<>{}=;]*[A-Za-zÀ-ÿ.!?])\s*</g)) {
      if (!/^\s*(const|return|import|export)\b/.test(m[1]) && /\s/.test(m[1].trim()) || /^[A-ZÀ-Ý][a-zà-ÿ]{2,}$/.test(m[1].trim()))
        errors.push(`${rel}: hard-coded text "${m[1].trim()}"`);
    }
  }
}
if (errors.length) { errors.forEach((e) => console.error('✗', e)); process.exit(1); }
console.log(`✓ i18n ok (${Object.keys(en).length} keys)`);
