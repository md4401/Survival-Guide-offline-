// Core install size = everything in dist/ (precached shell + vital content + EN/PT packs). Budget: 50 MB (spec §12).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/content';

const BUDGET = 50 * 1024 * 1024;
const dist = path.join(ROOT, 'dist');
if (!fs.existsSync(dist)) { console.error('✗ run `npm run build` first'); process.exit(1); }
const files: Array<[string, number]> = [];
(function walk(d: string) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p) : files.push([path.relative(dist, p), fs.statSync(p).size]);
  }
})(dist);
const total = files.reduce((n, [, s]) => n + s, 0);
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
for (const [f, s] of files.sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${kb(s).padStart(10)}  ${f}`);
console.log(`Total core: ${kb(total)} (${((total / BUDGET) * 100).toFixed(2)}% of 50 MB budget)`);
if (total > BUDGET) { console.error('✗ core exceeds 50 MB'); process.exit(1); }
console.log('✓ within budget');
