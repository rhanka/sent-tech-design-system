// Mesures navigateur O3, dans Chromium, sous la CSP stricte du harnais A0 servie en en-tête :
//   - témoin positif d'abord (un run sans violation style-src-attr au témoin est invalide) ;
//   - poids réellement chargé par page (réponses réseau observées, pesées sur disque) ;
//   - premier rendu : RUNS tours, ordre des pages mélangé à chaque tour (graine fixe),
//     un contexte neuf par exécution (cache vide) ;
//   - pages SSR : mêmes mesures, plus un chargement sans JavaScript (ce que montre le HTML seul).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';
import { SIZES } from './scene.mjs';
import { describe } from './stats.mjs';

const PLAYWRIGHT_CORE = process.env.PLAYWRIGHT_CORE
  ?? new URL('../../../node_modules/playwright-core/index.js', import.meta.url).pathname;
const { chromium } = (await import(PLAYWRIGHT_CORE)).default;
const DIST = new URL('../dist-o3/', import.meta.url).pathname;
const RUNS = Number(process.env.RUNS ?? 30);
const WARMUP = 2;

// Même politique que serve-and-measure.mjs (§1 du dossier A0).
export const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self'", "style-src-attr 'none'",
  "img-src 'self' data:", "font-src 'self' data:", "connect-src 'self'", "worker-src 'none'",
  "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'"
].join('; ');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.bpmn': 'application/xml', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject' };

const CSR = ['svelte-empty', 'static-vanilla', 'static-svelte', 'elk-client', 'xyflow', 'bpmn-viewer', 'bpmn-modeler'];
const SSR = ['ssr-static', 'ssr-xyflow', 'ssr-xyflow-sized', 'ssr-xyflow-sized-handles'];

function configs() {
  const list = [];
  for (const n of SIZES) {
    for (const p of CSR) if (p !== 'svelte-empty' || n === SIZES[0]) list.push({ page: p, n, url: `/o3/pages/${p}.html?n=${n}` });
    for (const p of SSR) list.push({ page: p, n, url: `/o3/pages/${p}-${n}.html` });
  }
  return list;
}

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32); }
function shuffle(a, r) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

const log = (...a) => { if (process.env.O3_VERBOSE !== '0') console.error('[o3]', ...a); };

async function load(browser, base, url, { js = true, recordNetwork = false } = {}) {
  const t0 = Date.now();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: js });
  const page = await ctx.newPage();
  const consoleMsgs = []; const network = [];
  page.on('console', (m) => consoleMsgs.push({ type: m.type(), text: m.text().slice(0, 240) }));
  page.on('pageerror', (e) => consoleMsgs.push({ type: 'pageerror', text: String(e).slice(0, 240) }));
  if (recordNetwork) page.on('response', (r) => network.push({ url: new URL(r.url()).pathname, status: r.status(), type: r.request().resourceType() }));
  await page.goto(base + url, { waitUntil: js ? 'load' : 'domcontentloaded' });
  let result = null, violations = [];
  if (js) {
    await page.waitForFunction(() => window.__result !== undefined, null, { timeout: 30000 }).catch(() => {});
    result = await page.evaluate(() => window.__result ?? { ok: false, error: 'aucun résultat' });
    violations = await page.evaluate(() => window.__csp ?? []);
  } else {
    await page.waitForTimeout(300);
    // Sans JavaScript : ce que montre le HTML servi seul (évaluation par le pilote, pas par la page).
    result = await page.evaluate(() => {
      const vis = (sel) => [...document.querySelectorAll(sel)];
      const flowNodes = vis('.svelte-flow__node');
      return {
        noeudsStatiques: vis('.st-scene-node').length,
        aretesStatiques: vis('.st-scene-edge').length,
        noeudsXyflow: flowNodes.length,
        noeudsXyflowVisibles: flowNodes.filter((n) => getComputedStyle(n).visibility === 'visible').length,
        noeudsXyflowPositionnes: flowNodes.filter((n) => getComputedStyle(n).transform !== 'none').length,
        aretesXyflow: vis('.svelte-flow__edge-path').length,
        elementsAvecAttributStyle: vis('[style]').length
      };
    }).catch((e) => ({ erreur: String(e).slice(0, 200) }));
  }
  await ctx.close();
  if (Date.now() - t0 > 4000) log('chargement lent', url, Date.now() - t0, 'ms', JSON.stringify(result).slice(0, 160));
  const cspConsole = consoleMsgs.filter((m) => /Content Security Policy/.test(m.text));
  return { result, violations, consoleMsgs, cspConsole, network };
}

async function weigh(network) {
  const files = [];
  for (const r of network) {
    if (r.type === 'document' || r.status !== 200 || /^\/scene-/.test(r.url)) continue;
    const path = join(DIST, normalize(r.url));
    const body = await readFile(path);
    files.push({ url: r.url, type: r.type, octets: body.length, gzip: gzipSync(body).length });
  }
  const sum = (f, k) => files.filter(f).reduce((a, x) => a + x[k], 0);
  const isJs = (x) => x.type === 'script', isCss = (x) => x.type === 'stylesheet', other = (x) => !isJs(x) && !isCss(x);
  return { js: { octets: sum(isJs, 'octets'), gzip: sum(isJs, 'gzip') }, css: { octets: sum(isCss, 'octets'), gzip: sum(isCss, 'gzip') },
    autres: { octets: sum(other, 'octets'), gzip: sum(other, 'gzip') },
    total: { octets: sum(() => true, 'octets'), gzip: sum(() => true, 'gzip') }, fichiers: files };
}

export async function runBrowser() {
  // Préfixe /nocsp/ : même fichier servi sans CSP (témoin de ce que la CSP retire, pages SSR seulement).
  const server = createServer(async (req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]);
    const noCsp = url.startsWith('/nocsp/');
    if (noCsp) url = url.slice('/nocsp'.length);
    const h = noCsp ? {} : { 'Content-Security-Policy': CSP };
    const path = join(DIST, normalize(url).replace(/^(\.\.[/\\])+/, ''));
    try {
      const body = await readFile(path);
      res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store', ...h });
      res.end(body);
    } catch { res.writeHead(404, h); res.end('not found'); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const EXE = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
  const out = { csp: CSP, browser: browser.version(), runs: RUNS, warmup: WARMUP, controle: null, pages: {} };

  const ctl = await load(browser, base, '/o3/pages/control.html');
  out.controle = { result: ctl.result, violations: ctl.violations.map((v) => v.directive),
    valide: ctl.violations.length === 1 && ctl.violations[0].directive === 'style-src-attr' && ctl.result?.attrStyleApplied === 'rgba(0, 0, 0, 0)' };
  if (!out.controle.valide) { await browser.close(); server.close(); return out; }

  const list = configs();
  const key = (c) => `${c.page}@${c.n}`;
  for (const c of list) {
    log('échauffement', key(c));
    const warm = [];
    for (let i = 0; i < WARMUP; i++) warm.push(await load(browser, base, c.url, { recordNetwork: i === 0 }));
    const w = warm[0];
    out.pages[key(c)] = { page: c.page, n: c.n, url: c.url, poids: await weigh(w.network),
      echauffementOk: warm.every((x) => x.result?.ok), echantillon: w.result,
      // Deux sources : l'écouteur de la page (ne voit pas ce qui est bloqué pendant l'analyse du HTML,
      // avant l'exécution des modules) et la console (voit tout). La colonne de synthèse lit la console.
      violations: w.violations.map((v) => `${v.directive} ${v.sample || ''} ${v.source}`.trim()),
      consoleCsp: w.cspConsole.length, console: w.consoleMsgs.filter((m) => m.type !== 'log').slice(0, 6), runs: [] };
    if (SSR.includes(c.page)) {
      const nojs = await load(browser, base, c.url, { js: false });
      out.pages[key(c)].sansJavascript = { ...nojs.result, messagesCspConsole: nojs.cspConsole.length,
        exempleCsp: nojs.cspConsole[0]?.text ?? null };
      const nocsp = await load(browser, base, '/nocsp' + c.url);
      out.pages[key(c)].sansCsp = { result: nocsp.result, messagesCspConsole: nocsp.cspConsole.length };
    }
  }
  // Une page qui échoue à l'échauffement n'est pas chronométrée : son état est consigné tel quel.
  const timed = list.filter((c) => out.pages[key(c)].echauffementOk);
  const r = rng(20260921);
  for (let round = 0; round < RUNS; round++) {
    log('tour', round + 1, '/', RUNS);
    for (const c of shuffle(timed, r)) {
      const { result, violations, cspConsole } = await load(browser, base, c.url);
      out.pages[key(c)].runs.push({ ok: !!result?.ok, tReady: result?.tReady, tPainted: result?.tPainted,
        tRender: result?.tReady != null && result?.tStart != null ? result.tReady - result.tStart : null,
        tData: result?.tData, fcp: result?.fcp, tLayout: result?.tLayout ?? null, violations: violations.length, cspConsole: cspConsole.length,
        tHydrated: result?.tHydrated ?? null,
        nodes: result?.nodes, edges: result?.edges });
    }
  }
  for (const p of Object.values(out.pages)) {
    const ok = p.runs.filter((x) => x.ok);
    p.stats = { runsOk: ok.length, runsKo: p.runs.length - ok.length,
      tReady: describe(ok.map((x) => x.tReady)), tRender: describe(ok.map((x) => x.tRender)),
      tPainted: describe(ok.map((x) => x.tPainted)), fcp: describe(ok.map((x) => x.fcp)),
      tLayout: describe(ok.map((x) => x.tLayout)),
      tHydrated: describe(ok.map((x) => x.tHydrated)),
      violationsParRun: [...new Set(p.runs.map((x) => x.violations))],
      cspConsoleParRun: [...new Set(p.runs.map((x) => x.cspConsole))] };
  }
  await browser.close();
  server.close();
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(await runBrowser(), null, 2));
