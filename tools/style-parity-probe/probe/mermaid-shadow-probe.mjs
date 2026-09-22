// Pilote de la sonde d'ombre : même page servie deux fois, sans CSP puis sous la CSP stricte
// du harnais A0 (tools/csp-spike), en en-tête HTTP.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { inflateSync } from 'node:zlib';

// Décodeur PNG minimal (8 bits, RGB ou RGBA, non entrelacé : ce que produit Chromium).
function lumaStats(png) {
  let o = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (o < png.length) {
    const len = png.readUInt32BE(o), type = png.toString('ascii', o + 4, o + 8), d = png.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; }
    if (type === 'IDAT') idat.push(d);
    o += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3, raw = inflateSync(Buffer.concat(idat)), stride = w * bpp;
  const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      const pred = f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : f === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) : 0;
      px[y * stride + x] = (line[x] + pred) & 255;
    }
  }
  let sum = 0, min = 255;
  for (let i = 0; i < px.length; i += bpp) { const l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; sum += l; if (l < min) min = l; }
  return { luminanceMoyenne: Math.round((sum / (w * h)) * 10) / 10, luminanceMin: Math.round(min), pixels: w * h };
}
const PW = process.env.PLAYWRIGHT_CORE ?? '/home/antoinefa/src/sent-tech-design-system/node_modules/playwright-core/index.js';
const { chromium } = (await import(PW)).default;
const ROOT = new URL('../', import.meta.url).pathname;
const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self'", "style-src-attr 'none'",
  "img-src 'self' data:", "font-src 'self' data:", "connect-src 'self'", "worker-src 'none'",
  "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'"
].join('; ');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
let mode = 'sans-csp';
const server = createServer(async (req, res) => {
  const p = join(ROOT, normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, ''));
  const h = mode === 'csp-stricte' ? { 'Content-Security-Policy': CSP } : {};
  try { const b = await readFile(p); res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream', ...h }); res.end(b); }
  catch { res.writeHead(404, h); res.end('nope'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const out = { date: new Date().toLocaleDateString('sv-SE'), horodatage: new Date().toISOString(), navigateur: browser.version(),
  mermaid: JSON.parse(readFileSync(new URL('../node_modules/mermaid/package.json', import.meta.url), 'utf8')).version,
  securityLevel: 'strict', csp: CSP, modes: {} };
for (const m of ['sans-csp', 'csp-stricte']) {
  mode = m;
  const page = await browser.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(String(e).slice(0, 200)));
  await page.goto(`${base}/probe/mermaid-shadow.html`);
  await page.waitForFunction(() => window.__done === true, null, { timeout: 60000 }).catch(() => {});
  const res = await page.evaluate(() => window.__out ?? { erreur: 'aucun résultat' });
  // Luminance des bandes (fond blanc = 255) : une ombre peinte l'abaisse.
  for (const v of Object.values(res.variantes ?? {})) {
    if (!v.bandes) continue;
    v.luminance = {};
    for (const [emb, bs] of Object.entries(v.bandes)) {
      v.luminance[emb] = {};
      for (const [cote, clip] of Object.entries(bs)) {
        const png = await page.screenshot({ clip, fullPage: true });
        v.luminance[emb][cote] = lumaStats(png);
      }
    }
  }
  out.modes[m] = { ...res, violationsTotal: await page.evaluate(() => (window.__csp ?? []).map((v) => v.directive)), erreursPage: erreurs };
  await page.close();
}
console.log(JSON.stringify(out, null, 2));
await browser.close(); server.close();
