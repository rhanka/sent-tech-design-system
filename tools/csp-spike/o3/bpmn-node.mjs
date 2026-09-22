// bpmn-js côté serveur, dans un processus isolé (un mode par exécution) :
//   plain : Node nu, sans DOM ;
//   jsdom : DOM émulé par jsdom, sans aucun polyfill ajouté.
// Sortie : une ligne JSON { mode, etapes: [{ etape, ok, erreur? }], ... }.
import { readFileSync } from 'node:fs';
const mode = process.argv[2] ?? 'plain';
const n = Number(process.argv[3] ?? 35);
const xml = readFileSync(new URL(`./public/scene-${n}.bpmn`, import.meta.url), 'utf8');
const out = { mode, n, etapes: [] };
// Chemins rendus relatifs au dépôt dans les messages d'erreur consignés.
const REPO = new URL('../../../', import.meta.url).pathname;
const rel = (t) => t.split(REPO).join('');
const step = async (etape, fn) => {
  try { const v = await fn(); out.etapes.push({ etape, ok: true, ...(v ?? {}) }); return true; }
  catch (e) { out.etapes.push({ etape, ok: false, erreur: rel(String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e)).slice(0, 400) }); return false; }
};
let container = undefined;
if (mode === 'jsdom') {
  await step('jsdom', async () => {
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM('<!doctype html><html><body><div id="c"></div></body></html>', { pretendToBeVisual: true });
    const w = dom.window;
    for (const k of Object.getOwnPropertyNames(w)) {
      if (!(k in globalThis)) { try { globalThis[k] = w[k]; } catch {} }
    }
    globalThis.window = w; globalThis.document = w.document;
    container = w.document.getElementById('c');
    return { getBBox: typeof w.SVGElement.prototype.getBBox, getScreenCTM: typeof w.SVGElement.prototype.getScreenCTM };
  });
}
// 1. Import direct par Node ESM (sans empaqueteur), pour mémoire.
await step('import direct bpmn-js/lib/Viewer.js (Node ESM)', async () => { await import('bpmn-js/lib/Viewer.js'); });
// 2. Import de bpmn-js empaqueté par le build SSR de Vite (dist-o3-ssr/ssr-bpmn.js).
let Viewer;
if (await step('import bpmn-js empaqueté (vite build --ssr)', async () => { Viewer = (await import('../dist-o3-ssr/ssr-bpmn.js')).BpmnViewer; })) {
  let viewer;
  if (await step('new Viewer()', async () => { viewer = new Viewer(container ? { container } : {}); })) {
    if (await step('importXML', async () => { const r = await viewer.importXML(xml); return { warnings: r.warnings.length }; })) {
      await step('saveSVG', async () => { const { svg } = await viewer.saveSVG(); return { octets: Buffer.byteLength(svg), styleAttrs: (svg.match(/style="/g) || []).length }; });
    }
  }
}
console.log(JSON.stringify(out));
