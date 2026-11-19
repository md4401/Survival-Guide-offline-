// Two isolated "devices" (separate browser contexts = separate storage) exchanging messages without any server.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH ?? 'playwright');
const PORT = 4175; const BASE = `http://localhost:${PORT}/`;
const srv = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = true; const check = (n, c, x = '') => { console.log(`${c ? '✓' : '✗'} ${n} ${x}`); if (!c) ok = false; };
try {
  await wait(2500);
  const browser = await chromium.launch({ args: ['--disable-features=WebRtcHideLocalIpsWithMdns'] });
  const device = async () => { const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } }); const p = await ctx.newPage(); await p.goto(BASE); await p.waitForSelector('main'); return p; };
  const go = async (p, h, sel = 'main') => { await p.goto(`${BASE}#/${h}`); await p.waitForSelector(sel); };
  const send = async (p, text) => { await p.fill('input[aria-label="Write a message"]', text); await p.click('button:has-text("Send")'); await p.waitForSelector(`text=${text}`); };

  // ---- Bundle exchange + private channel
  const A = await device(), B = await device();
  await go(A, 'messages/c/public'); await send(A, 'public hello from A');
  check('A can post to the public channel', true);
  await go(A, 'messages', 'input[aria-label="Channel name"]');
  await A.fill('input[aria-label="Channel name"] >> nth=0', 'Family'); await A.click('button:has-text("Create with a random passphrase")');
  await A.waitForSelector('strong[dir=ltr]'); const pass = (await A.textContent('strong[dir=ltr]')).trim();
  check('random passphrase generated', /^([A-Z2-9]{4}-){3}[A-Z2-9]{4}$/.test(pass), pass);
  await A.click('a:has-text("Family")'); await A.waitForSelector('h1:has-text("Family")'); await send(A, 'private hello from A');
  await go(A, 'messages/sync', 'button:has-text("Create bundle")'); await A.click('button:has-text("Create bundle")');
  await A.waitForSelector('textarea[readonly]'); const bundle = await A.inputValue('textarea[readonly] >> nth=0');
  check('bundle created (compressed text)', bundle.startsWith('SGMB1.'), `(${bundle.length} chars)`);

  await go(B, 'messages/sync', 'textarea[aria-label="Paste a bundle here"]');
  await B.fill('textarea[aria-label="Paste a bundle here"]', bundle); await B.click('button:has-text("Import")');
  await B.waitForSelector('[role=status]:has-text("2 new")'); check('B imported 2 new messages offline', true);
  await go(B, 'messages/c/public'); await B.waitForSelector('text=public hello from A'); check('B reads the public message, signature verified', (await B.textContent('main')).includes('✓'));
  await go(B, 'messages', 'textarea[aria-label="Passphrase"]');
  await B.fill('textarea[aria-label="Passphrase"]', 'WRONG-WRONG-WRONG-1'); await B.click('button:has-text("Join")');
  await B.waitForURL(/#\/messages\/c\//); await B.waitForSelector('text=No messages yet'); // a wrong passphrase just opens a different, empty channel
  check('wrong passphrase does not reveal the private message', !(await B.textContent('main')).includes('private hello from A'));
  await go(B, 'messages', 'textarea[aria-label="Passphrase"]');
  await B.fill('textarea[aria-label="Passphrase"]', pass);
  await B.fill('input[aria-label="Channel name"] >> nth=1', 'Family'); await B.click('button:has-text("Join")');
  await B.waitForSelector('text=private hello from A'); check('B joins with the passphrase and reads the decrypted message', true);
  // a tampered bundle is rejected
  const bad = bundle.slice(0, -6) + 'AAAAAA';
  await go(B, 'messages/sync', 'textarea[aria-label="Paste a bundle here"]'); await B.fill('textarea[aria-label="Paste a bundle here"]', bad); await B.click('button:has-text("Import")');
  await B.waitForSelector('[role=status]'); check('corrupted bundle does not add anything', !(await B.textContent('[role=status]')).includes('2 new'));

  // ---- Live link over WebRTC (no STUN, no server): C hosts, D joins, then they chat
  const C = await device(), D = await device();
  await go(C, 'messages/sync', 'button:has-text("Start a link")'); await C.click('button:has-text("Start a link")');
  await C.waitForFunction(() => document.querySelector('textarea[aria-label="1. Show this code to the other device."]')?.value?.startsWith('SGMR'), null, { timeout: 15000 });
  const offer = await C.inputValue('textarea[aria-label="1. Show this code to the other device."]');
  await go(D, 'messages/sync', 'button:has-text("Join a link")'); await D.click('button:has-text("Join a link")');
  await D.fill('textarea[aria-label="Paste the other device\'s code"]', offer); await D.click('button:has-text("Connect")');
  await D.waitForFunction(() => document.querySelector('textarea[aria-label="Show this answer code to the first device."]')?.value?.startsWith('SGMR'), null, { timeout: 15000 });
  const answer = await D.inputValue('textarea[aria-label="Show this answer code to the first device."]');
  await C.fill('textarea[aria-label="Paste the other device\'s code"]', answer); await C.click('button:has-text("Connect")');
  await C.waitForSelector('text=Connected to', { timeout: 20000 }); await D.waitForSelector('text=Connected to', { timeout: 20000 });
  check('live link connected over local WebRTC', true);
  await go(C, 'messages/c/public'); await send(C, 'live from C');
  await go(D, 'messages/c/public'); await D.waitForSelector('text=live from C', { timeout: 10000 });
  check('link survives navigation and delivers the message to D', true);
  await send(D, 'reply from D'); await C.waitForSelector('text=reply from D', { timeout: 10000 }); check('reply arrives on C (two-way)', true);
  await browser.close();
} catch (e) { console.error(e); ok = false; }
srv.kill(); process.exit(ok ? 0 : 1);
