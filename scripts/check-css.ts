// RTL safety: fail on physical (left/right) CSS properties in styles and inline styles. Use logical properties.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/content';

const BAD = /(margin|padding|border)-(left|right)|(^|[\s;{"'])(left|right)\s*:|text-align\s*:\s*(left|right)|float\s*:\s*(left|right)|border-(top|bottom)-(left|right)-radius/;
function files(d: string): string[] {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? (e.name === 'generated' ? [] : files(p)) : /\.(css|tsx)$/.test(e.name) ? [p] : [];
  });
}
const errors: string[] = [];
for (const f of files(path.join(ROOT, 'src'))) {
  fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => { if (BAD.test(line) && (f.endsWith('.css') || /style=/.test(line))) errors.push(`${path.relative(ROOT, f)}:${i + 1}: ${line.trim()}`); });
}
if (errors.length) { errors.forEach((e) => console.error('✗ physical property:', e)); process.exit(1); }
console.log('✓ css uses logical properties');
