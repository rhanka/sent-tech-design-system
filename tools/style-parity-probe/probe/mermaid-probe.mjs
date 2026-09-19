import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const PW = process.env.PLAYWRIGHT_CORE ?? '/home/antoinefa/src/sent-tech-design-system/node_modules/playwright-core/index.js';
const { chromium } = (await import(PW)).default;
const ROOT = new URL('../', import.meta.url).pathname;
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json' };
const server = createServer(async (req, res) => {
  const p = join(ROOT, normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, ''));
  try { const b = await readFile(p); res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end('nope'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('PAGEERROR', String(e).slice(0, 300)));
await page.goto(`${base}/probe/mermaid.html`);
await page.waitForFunction(() => window.__done === true, { timeout: 60000 }).catch(() => {});
console.log(JSON.stringify(await page.evaluate(() => window.__out), null, 2));
await browser.close(); server.close();
