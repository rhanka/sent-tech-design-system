import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
// playwright-core et le binaire Chromium sont pris à l'extérieur du spike :
// PLAYWRIGHT_CORE pointe le module, CHROMIUM_PATH le binaire (sinon, Chromium
// par défaut de playwright-core). Aucun téléchargement n'est déclenché ici.
const PLAYWRIGHT_CORE = process.env.PLAYWRIGHT_CORE
  ?? new URL('../../node_modules/playwright-core/index.js', import.meta.url).pathname;
const playwright = (await import(PLAYWRIGHT_CORE)).default;
const { chromium } = playwright;

// DIST : dossier servi (par défaut ./dist ; token-paths/run.sh passe le sien).
const DIST = process.env.DIST ?? new URL('./dist/', import.meta.url).pathname;
const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self'", "style-src-attr 'none'",
  "img-src 'self' data:", "font-src 'self' data:", "connect-src 'self'", "worker-src 'none'",
  "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'"
].join('; ');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject' };

const server = createServer(async (req, res) => {
  const path = join(DIST, normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, ''));
  try {
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Content-Security-Policy': CSP });
    res.end(body);
  } catch { res.writeHead(404, { 'Content-Security-Policy': CSP }); res.end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const EXE = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
const out = { csp: CSP, browser: browser.version(), pages: {} };
for (const name of ['index']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 200)));
  await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__result !== undefined, { timeout: 20000 }).catch(() => {});
  if (process.env.INTERACT === '1') {
    const node = await page.$('.svelte-flow__node');
    if (node) { const b = await node.boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down(); await page.mouse.move(b.x + 160, b.y + 90, { steps: 12 }); await page.mouse.up(); }
    const pane = await page.$('.svelte-flow__pane');
    if (pane) { const p = await pane.boundingBox();
      await page.mouse.move(p.x + p.width / 2, p.y + p.height / 2);
      await page.mouse.wheel(0, -260); }
  }
  await page.waitForTimeout(400);
  const result = await page.evaluate(() => window.__result ?? { ok: false, error: 'aucun résultat' });
  const violations = await page.evaluate(() => window.__csp ?? []);
  await page.screenshot({ path: `${DIST}../shot-${name}.png` });
  out.pages[name] = { result, violations, consoleErrors };
  await page.close();
}
await browser.close();
server.close();
console.log(JSON.stringify(out, null, 2));
