// Builds manifest.json for the live-update bundle: every file of dist/ with its size and SHA-256.
// Usage: node scripts/make-live-manifest.mjs <distDir> <outFile>   (BUILD_ID and MIN_APK come from the environment)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const [dist, out] = process.argv.slice(2);
const SKIP = /^(sw\.js|workbox-[\w-]+\.js|manifest\.webmanifest)$/; // service-worker files are not used inside the app
const files = [];
const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else { const rel = path.relative(dist, p).split(path.sep).join('/'); if (!SKIP.test(rel)) { const b = fs.readFileSync(p); files.push({ path: rel, size: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex') }); } } } };
walk(dist); files.sort((a, b) => a.path.localeCompare(b.path));
const manifest = { version: process.env.BUILD_ID || 'dev', minApk: Number(process.env.MIN_APK || 0), built: Date.now(), files };
fs.writeFileSync(out, JSON.stringify(manifest));
console.log(`manifest: ${files.length} files, ${(files.reduce((n, f) => n + f.size, 0) / 1048576).toFixed(2)} MB, version ${manifest.version}`);
