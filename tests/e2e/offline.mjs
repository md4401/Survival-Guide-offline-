// Run: npm run build && npm run test:e2e   (needs playwright + chromium; preinstalled in the cloud sandbox)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? 'playwright');

const PORT = 4173;
const srv = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = true;
const check = (name, cond, extra = '') => { console.log(`${cond ? '✓' : '✗'} ${name} ${extra}`); if (!cond) ok = false; };
try {
  await wait(2500);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${PORT}/`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await wait(1500); // let precache finish
  await ctx.setOffline(true);

  // "Tap 1" = opening the app from the icon (cold load while offline).
  const t0 = Date.now();
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector('.help-btn');
  const tOpen = Date.now() - t0;
  let taps = 1;
  await page.click('.help-btn'); taps++;                         // 2: "I need help now"
  await page.click('a[href="#/triage/water.diy-filter"]'); taps++; // 3: situation
  await page.waitForSelector('ol.steps li');
  const total = Date.now() - t0;
  const first = await page.textContent('ol.steps li');
  check('offline cold start renders home', tOpen < 2000, `(${tOpen} ms)`);
  check('icon → first emergency step in ≤3 taps', taps <= 3, `(${taps} taps, ${total} ms, step: "${first}")`);

  // Offline functionality
  await page.goto(`http://localhost:${PORT}/#/numbers`);
  check('emergency numbers offline', (await page.textContent('main')).includes('190') || (await page.textContent('main')).includes('911'));
  await page.goto(`http://localhost:${PORT}/#/guide/shelter.camp-setup`);
  await page.waitForSelector('ol.steps li');
  check('camp guide offline', true);
  // Almanac pages offline
  const go = async (h, sel) => { await page.goto(`http://localhost:${PORT}/#/${h}`); await page.waitForSelector(sel, { timeout: 5000 }); };
  await go('world/countries', 'details.card');
  const n = await page.$$eval('details.card', (e) => e.length);
  check('250 countries offline', n === 250, `(${n})`);
  await go('world/clock', '.big-num'); check('clock renders', /\d/.test(await page.textContent('.big-num')));
  await go('world/sun', 'h2'); check('sun/moon renders', (await page.textContent('main')).length > 100);
  await go('world/calendar', 'table.cal'); check('calendar renders', true);
  await go('world/climate', 'table.cal'); await page.fill('input[type=search]', 'London'); await page.waitForSelector('text=Cfb'); check('climate: London is Cfb', true);
  await go('world/tables', 'table.cal'); check('tables render', true);
  await go('world/counter', 'h1'); check('counter renders', true);
  await go('prepare/kit/72h', 'input[type=checkbox]');
  await page.click('input[type=checkbox]'); await wait(400);
  await page.reload(); await page.waitForSelector('input[type=checkbox]');
  await wait(300);
  check('checklist persists offline (IndexedDB)', await page.$eval('input[type=checkbox]', (e) => e.checked));
  await go('tools/converter', 'button.tool'); await page.click('button.tool'); await page.waitForSelector('input'); check('converter hub opens a converter', true);
  await go('tools/timer', '.big-num'); check('timer renders', true);
  await go('prepare/family', 'h1'); check('family plan renders', true);
  await go('onboarding', 'h1'); check('onboarding renders', true);
  await go('search', 'input[type=search]'); await page.fill('input[type=search]', 'watr'); await page.waitForSelector('ul.list a');
  check('search tolerates typos offline', (await page.textContent('ul.list')).toLowerCase().includes('water'));
  check('no uncaught errors', errors.length === 0, errors.join('|'));
  // Part A screens, offline
  await go('tools/morse', 'textarea'); await page.fill('textarea', 'SOS');
  check('morse converter', (await page.textContent('.big-num')).includes('... --- ...'));
  check('phonetic spelling', (await page.textContent('main')).includes('Sierra Oscar Sierra'));
  await go('compass', 'button.help-btn'); await page.click('button.help-btn');
  await page.waitForSelector('.danger-box[role=alert]', { timeout: 6000 }); check('compass explains when there is no sensor', true);
  await go('world/zones', 'section.card'); check('Köppen legend with 30 classes', (await page.$$eval('section.card li', (e) => e.length)) === 30);
  await go('world/cmap', 'svg circle'); check('climate map plots 1000+ cities', (await page.$$eval('svg circle', (e) => e.length)) > 1000);
  await go('world/numbers', 'section.card'); await page.waitForSelector('text=250 countries and territories'); check('world in numbers', true);
  await go('guide/water.diy-filter', 'ol.steps li');
  await page.click('button:has-text("Report an error")'); await page.fill('textarea', 'step 3 unclear'); await page.click('button.btn-danger');
  await page.waitForSelector('[role=status]:has-text("Saved on this device")'); check('error report saved offline', true);
  await go('settings', 'input[type=password]');
  await page.waitForSelector('text=Saved error reports (1)'); check('report listed in settings', true);
  await page.fill('input[type=password]', 'segredo123');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Export backup")')]);
  const path = await dl.path(); check('backup downloaded', !!path);
  await page.click('button:has-text("🗑")'); await page.waitForSelector('text=Saved error reports (0)');
  await page.setInputFiles('input[type=file]', path);
  await page.waitForSelector('[role=status]:has-text("Backup restored")'); await page.waitForSelector('text=Saved error reports (1)');
  check('backup import restores data', true);
  await page.fill('input[type=password]', 'wrong-pass'); await page.setInputFiles('input[type=file]', path);
  await page.waitForSelector('[role=status]:has-text("Wrong password")'); check('wrong password refused', true);
  // Part B: machine-translated guides are drafts: hidden from users (English + notice), visible in Developer mode
  await go('settings', 'select'); await page.selectOption('select', 'es');
  await go('guide/water.diy-filter', 'ol.steps li');
  check('Spanish user still gets the published English guide, with a notice', (await page.textContent('h1')).includes('homemade water filter') && (await page.textContent('main')).includes('Aún no disponible en su idioma'));
  await go('settings', 'select'); await page.check('input[type=checkbox] >> nth=2');
  await go('guide/water.diy-filter', 'ol.steps li');
  check('developer mode shows the Spanish draft', (await page.textContent('h1')).includes('filtro de agua casero') && (await page.textContent('main')).includes('Borrador'));
  await go('settings', 'select'); await page.uncheck('input[type=checkbox] >> nth=2'); await page.selectOption('select', 'en');
  // Readiness score, About page
  await go('prepare/score', 'progress'); check('readiness score page', (await page.textContent('main')).includes('/100'));
  await go('about', 'section.card'); check('about/privacy page', (await page.textContent('main')).includes('Everything you save'));
  // Plans, legal pages, messages hub
  await go('plans', 'section.card'); check('plans page lists free and premium features', (await page.textContent('main')).includes('Always free (vital)') && (await page.textContent('main')).includes('Nearby messages'));
  await go('legal/privacy', 'main'); check('privacy policy covers nearby messages', (await page.textContent('main')).includes('Nearby messages'));
  await go('legal/terms', 'main'); check('terms cover premium and messages', (await page.textContent('main')).includes('Free and Premium') && (await page.textContent('main')).includes('best effort'));
  await go('messages', 'main'); await page.waitForSelector('text=Everyone nearby'); check('messages hub offline', true);
  // AI assistant (no model installed): vital → direct guide path, blocked topics, guide fallback, offline download refused
  await go('assistant', 'input');
  await page.fill('input[aria-label]', 'how many mg of ibuprofen can I take'); await page.click('button.btn-danger');
  await page.waitForSelector('.danger-box:has-text("cannot give medicine doses")');
  check('assistant blocks dose questions', true);
  await page.fill('input[aria-label]', 'someone is not breathing'); await page.click('button.btn-danger');
  await page.waitForSelector('a[href="#/emergency"].btn-danger');
  check('assistant sends life-risk questions to the vital guide/emergency (no AI)', true);
  await page.fill('input[aria-label]', 'water filter'); await page.click('button.btn-danger');
  await page.waitForSelector('a[href="#/guide/water.diy-filter"]');
  check('assistant without a model lists matching guides', true);
  await go('assistant/models', 'section.card');
  await page.click('section.card button:has-text("Download")');
  await page.waitForSelector('[role=alert]:has-text("offline")');
  check('model download is refused while offline, nothing starts', true);
  // G0-G6: every new route renders offline without errors; Premium routes are gated for users and open in Developer mode
  {
    const before = errors.length;
    for (const h of ['signal', 'tools/distance', 'tools/level', 'prepare/stock', 'prepare/energy', 'prepare/docs', 'prepare/plan72', 'prepare/family', 'learn', 'learn/quiz', 'learn/trees', 'learn/trees/collapse', 'learn/map', 'library', 'library/myths', 'library/facts', 'library/cases', 'library/diy', 'library/glossary', 'library/phrases', 'library/find', 'library/scales', 'system']) {
      await go(h, 'main'); check(`#/${h} renders offline`, (await page.textContent('main')).trim().length > 20);
    }
    await go('library/scales', 'main'); check('heat index calculator works', (await page.textContent('main')).includes('°C'));
    await go('learn/quiz', 'main'); await page.click('main section button >> nth=0'); check('quiz gives feedback', (await page.textContent('main')).length > 40);
    const gated = ['trail', 'medcard', 'silent', 'inventory', 'learn/drill'];
    for (const h of gated) { await go(h, 'main'); check(`#/${h} is gated for normal users`, (await page.textContent('main')).includes('not available yet')); }
    await go('settings', 'select'); await page.check('input[type=checkbox] >> nth=2');
    for (const h of ['guide/comms.signals', 'guide/firstaid.triage', 'guide/shelter.fire']) { await go(h, 'ol.steps li'); check(`${h} (draft) renders in Developer mode`, true); }
    for (const h of gated) { await go(h, 'main'); check(`#/${h} opens in Developer mode`, !(await page.textContent('main')).includes('not available yet')); }
    await go('settings', 'select'); await page.uncheck('input[type=checkbox] >> nth=2');
    check('no uncaught errors on the new routes', errors.length === before, errors.slice(before).join('|'));
  }
  // H: redesigned Guides and Scenarios pages
  {
    await go('scenarios', 'main'); await page.waitForSelector('text=What is happening now?'); check('scenarios page renders with triage shortcut', (await page.textContent('main')).includes('What is happening now?') && !!(await page.$('a[href="#/triage"]')));
    await go('scenarios', 'ul.grid2'); { const n = await page.$$eval('ul.grid2 li', (e) => e.length); check('scenarios page shows all 33 scenario cards', n === 33, `(${n})`); }
    check('scenario cards start with the most urgent (house fire)', (await page.textContent('ul.grid2 li')).toLowerCase().includes('fire'));
    await go('guides', 'input[type=search]'); await wait(800); const total = await page.$$eval('section.stack h2', (e) => e.length);
    check('guides page groups guides by category', total >= 8, `(${total})`);
    check('guides page has the mental health category', (await page.textContent('main')).includes('Mental health'));
    await go('guide/mental.calm', 'ol.steps li'); check('new guides open in Developer mode', true);
    await go('guides', 'input[type=search]'); await wait(500);
    await page.fill('input[type=search]', 'tsunami'); await page.waitForSelector('a[href="#/guide/disaster.tsunami"]'); check('guides filter finds the tsunami guide', (await page.$$eval('ul.list li', (e) => e.length)) === 1);
    await page.fill('input[type=search]', 'zzzzzz'); await page.waitForSelector('text=No guide matches'); check('guides filter shows an empty state', true);
    await go('settings', 'select'); await page.uncheck('input[type=checkbox] >> nth=2');
  }
  // J: toolbox hub and new tools
  {
    const before = errors.length;
    await go('tools', 'a[data-tool]'); const nTools = await page.$$eval('a[data-tool]', (e) => e.length); check('toolbox hub lists 15 tools', nTools === 15, `(${nTools})`);
    await go('tools/calculator', 'input'); await page.fill('input', '2+3×4'); await page.click('button:text-is("=")'); await page.waitForSelector('.big-num:has-text("14")'); check('calculator: 2+3×4 = 14', true);
    await page.fill('input', '1/0'); await page.click('button:text-is("=")'); await page.waitForSelector('[role=alert]:has-text("divide by zero")'); check('calculator refuses division by zero', true);
    await go('tools/agenda', 'button[aria-label="Add event"]'); await page.click('button[aria-label="Add event"]'); await page.fill('input >> nth=0', 'Dentist'); await page.click('button:text-is("Save")'); await page.waitForSelector('text=Dentist');
    await page.reload(); await page.waitForSelector('text=Dentist'); check('agenda event persists offline', true);
    await page.click('button:has-text("Dentist")'); await page.click('button:text-is("Delete")'); await wait(300);
    for (const v of ['Week', 'Day', 'Year', 'Month']) { await page.click(`[role=tab]:text-is("${v}")`); } check('agenda has year/month/week/day views', true);
    for (const h of ['tools/recorder', 'tools/qrscan', 'tools/decibel', 'tools/metal', 'compass', 'tools/level', 'world/clock', 'world/calendar']) { await go(h, 'main'); check(`#/${h} renders offline`, (await page.textContent('main')).trim().length > 20); }
    await go('messages/geo', 'button.primary'); check('location channels stay off until consent', (await page.textContent('main')).includes('Off until you agree') && await page.$('button:text-is("I understand, turn on")') !== null);
    await go('tools/notes', 'button[aria-label="Add note"]'); await page.click('button[aria-label="Add note"]'); await page.waitForSelector('textarea'); await page.fill('textarea', '[ ] milk'); check('notes editor opens offline', await page.$('button[aria-label="Undo"]') !== null);
    await go('tools/metal', 'main'); check('metal detector explains missing sensor without fake data', (await page.textContent('main')).includes('cannot find coins') || (await page.textContent('main')).includes('magnetic sensor'));
    check('no uncaught errors in the toolbox', errors.length === before, errors.slice(before).join('|'));
  }
  // Low-end device simulation: CPU 6x slower, offline cold start → help → first step
  {
    const lp = await ctx.newPage(); const cdp = await ctx.newCDPSession(lp);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    const t1 = Date.now();
    await lp.goto(`http://localhost:${PORT}/`); await lp.waitForSelector('.help-btn');
    await lp.click('.help-btn'); await lp.click('a[href="#/triage/water.diy-filter"]'); await lp.waitForSelector('ol.steps li');
    const ms = Date.now() - t1;
    check('icon → first step ≤2 s with CPU 6x slower (offline)', ms <= 2000, `(${ms} ms)`);
    await lp.close();
  }
  // Accessibility: touch targets >= 48 px on key screens
  for (const h of ['', 'triage', 'emergency', 'guide/water.diy-filter', 'prepare', 'world', 'settings', 'messages', 'messages/sync', 'plans', 'world/climate', 'tools', 'tools/calculator', 'tools/agenda', 'tools/recorder', 'scenarios', 'guides', 'learn', 'library', 'library/phrases', 'system', 'signal', 'prepare/stock']) {
    await go(h, 'main');
    const small = await page.$$eval('a, button, select, input:not([type=checkbox]):not([type=range]):not([type=file])', (els) =>
      els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 47.5 || r.width < 47.5); })
        .map((e) => `${e.tagName}:${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 20)}`));
    check(`touch targets ≥48px on #/${h}`, small.length === 0, small.join(', '));
  }
  // RTL: switching to Arabic flips direction (strings fall back to English until translated)
  await go('settings', 'select');
  await page.selectOption('select', 'ar');
  check('Arabic sets dir=rtl', (await page.getAttribute('html', 'dir')) === 'rtl');
  await page.selectOption('select', 'pt');
  check('Portuguese sets dir=ltr and UI text', (await page.getAttribute('html', 'dir')) === 'ltr' && (await page.textContent('h1')).includes('Configurações'));
  await browser.close();
} catch (e) { console.error(e); ok = false; }
srv.kill();
process.exit(ok ? 0 : 1);
