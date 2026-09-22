// Comportement SSR, côté Node :
//   - rendu serveur Svelte (svelte/server) du repli statique et de xyflow, chronométré ;
//   - analyse de la sortie HTML (taille, attributs style, éléments de scène) ;
//   - pages SSR à hydrater, écrites dans dist-o3 pour la mesure navigateur ;
//   - bpmn-js en Node nu et sous jsdom (processus isolés, o3/bpmn-node.mjs) ;
//   - placement elkjs en Node (moitié serveur du repli statique), chronométré.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import ELK from 'elkjs/lib/elk.bundled.js';
import { SIZES, sceneInput } from './scene.mjs';
import { describe } from './stats.mjs';

const HERE = new URL('./', import.meta.url);
const DIST = new URL('../dist-o3/', import.meta.url);
const RUNS = Number(process.env.SSR_RUNS ?? 30);
const WARMUP = 3;
const COLD_RUNS = Number(process.env.ELK_COLD_RUNS ?? 10);
const COLD_SCRIPT = (n) => `
const t0 = performance.now();
const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
const t1 = performance.now();
const { sceneInput } = await import('./o3/scene.mjs');
const g = sceneInput(${n});
const t2 = performance.now();
await new ELK().layout(g);
const t3 = performance.now();
console.log(JSON.stringify({ importMs: t1 - t0, layoutMs: t3 - t2 }));`;

const PAGE_OF = { 'static-svelte': 'ssr-static', xyflow: 'ssr-xyflow', 'xyflow-sized': 'ssr-xyflow-sized',
  'xyflow-sized-handles': 'ssr-xyflow-sized-handles' };

function analyse(body) {
  const styles = [...body.matchAll(/style="([^"]*)"/g)].map((m) => m[1]);
  const props = [...new Set(styles.flatMap((s) => s.split(';').map((d) => d.split(':')[0].trim()).filter(Boolean)))];
  return {
    octets: Buffer.byteLength(body), octetsGzip: gzipSync(body).length,
    attributsStyle: styles.length, proprietesStyle: props,
    svg: (body.match(/<svg/g) ?? []).length,
    noeudsStatiques: (body.match(/class="st-scene-node"/g) ?? []).length,
    aretesStatiques: (body.match(/class="st-scene-edge"/g) ?? []).length,
    noeudsXyflow: (body.match(/class="svelte-flow__node /g) ?? []).length,
    aretesXyflow: (body.match(/class="svelte-flow__edge-path"/g) ?? []).length,
    noeudsVisibilityHidden: (body.match(/visibility: hidden/g) ?? []).length,
    noeudsMarquesSelected: (body.match(/class="svelte-flow__node [^"]*\bselected\b/g) ?? []).length
  };
}

export async function runSsr() {
  const { renderers } = await import(new URL('../dist-o3-ssr/ssr-entry.js', import.meta.url));
  const out = { runs: RUNS, svelte: {}, bpmn: {}, elkNode: {} };
  for (const n of SIZES) {
    const view = JSON.parse(readFileSync(new URL(`public/scene-${n}.placed.json`, HERE), 'utf8'));
    for (const [name, render] of Object.entries(renderers)) {
      const key = `${name}@${n}`;
      try {
        for (let i = 0; i < WARMUP; i++) void render(view).body;
        const times = [];
        let res;
        // svelte/server rend paresseusement : le chrono inclut la lecture de .body et .head.
        for (let i = 0; i < RUNS; i++) {
          const t0 = performance.now(); const r = render(view); const body = r.body; const head = r.head;
          times.push(performance.now() - t0); res = { body, head };
        }
        out.svelte[key] = { ok: true, msRendu: describe(times), head: res.head.length, ...analyse(res.body) };
        const tpl = readFileSync(new URL(`o3/pages/${PAGE_OF[name]}.html`, DIST), 'utf8');
        writeFileSync(new URL(`o3/pages/${PAGE_OF[name]}-${n}.html`, DIST),
          tpl.replace('@@SSR_OUTLET@@', () => res.body).replace('@@SSR_DATA@@', () => JSON.stringify(view)));
      } catch (e) {
        out.svelte[key] = { ok: false, erreur: String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e).slice(0, 400) };
      }
    }
    for (const mode of ['plain', 'jsdom']) {
      let line = '';
      try {
        line = execFileSync(process.execPath, [new URL('bpmn-node.mjs', HERE).pathname, mode, String(n)],
          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 60000 });
        out.bpmn[`${mode}@${n}`] = JSON.parse(line.trim().split('\n').pop());
      } catch (e) { out.bpmn[`${mode}@${n}`] = { ok: false, erreur: String(e).slice(0, 300), sortie: line.slice(0, 300) }; }
    }
    // À chaud : même processus, après WARMUP placements.
    const elk = new ELK();
    for (let i = 0; i < WARMUP; i++) await elk.layout(sceneInput(n));
    const times = [];
    for (let i = 0; i < RUNS; i++) { const g = sceneInput(n); const t0 = performance.now(); await elk.layout(g); times.push(performance.now() - t0); }
    // À froid : un processus neuf par mesure (import d'elkjs, puis premier placement).
    const cold = [];
    for (let i = 0; i < COLD_RUNS; i++) {
      const line = execFileSync(process.execPath, ['--input-type=module', '-e', COLD_SCRIPT(n)],
        { cwd: new URL('../', import.meta.url).pathname, encoding: 'utf8', timeout: 60000 });
      cold.push(JSON.parse(line.trim().split('\n').pop()));
    }
    out.elkNode[n] = { msPlacementChaud: describe(times), froid: { runs: COLD_RUNS,
      msImport: describe(cold.map((c) => c.importMs)), msPremierPlacement: describe(cold.map((c) => c.layoutMs)) } };
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(await runSsr(), null, 2));
