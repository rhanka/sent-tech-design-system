// O3 — commande unique : scènes → build de production → SSR (Node) → mesures Chromium → preuve datée.
//   PLAYWRIGHT_CORE=… CHROMIUM_PATH=… npm run o3
// Variables : RUNS (défaut 30), SSR_RUNS (défaut 30), O3_OUT (chemin de la preuve JSON).
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import os from 'node:os';
import { writeScenes } from './scene.mjs';
import { runSsr } from './ssr.mjs';
import { runBrowser } from './browser.mjs';

const ROOT = new URL('../', import.meta.url).pathname;
const vite = new URL('../node_modules/.bin/vite', import.meta.url).pathname;
const log = (...a) => console.error('[o3]', ...a);
const version = (p) => { try { return JSON.parse(readFileSync(new URL(`../node_modules/${p}/package.json`, import.meta.url), 'utf8')).version; } catch { return null; } };
const pwVersion = () => { try { return JSON.parse(readFileSync(new URL('package.json', `file://${process.env.PLAYWRIGHT_CORE}`), 'utf8')).version; } catch { return null; } };
const osName = () => { try { return readFileSync('/etc/os-release', 'utf8').match(/^PRETTY_NAME="?([^"\n]*)/m)?.[1] ?? null; } catch { return null; } };

// Date de mesure : locale (fuseau de la machine), prise au début du run ; horodatages ISO UTC à côté.
const debut = new Date();
const date = debut.toLocaleDateString('sv-SE');
log('scènes et placement serveur');
const scenes = await writeScenes();
log('build client (production)');
execFileSync(vite, ['build', '-c', 'o3/vite.config.js'], { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
log('build SSR');
execFileSync(vite, ['build', '-c', 'o3/vite.config.js', '--ssr'], { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
log('SSR côté Node');
const ssr = await runSsr();
log('mesures Chromium');
const browser = await runBrowser();

const evidence = {
  objet: 'O3 — instruction du repli SVG statique : poids, premier rendu, SSR',
  date, debut: debut.toISOString(), fin: new Date().toISOString(),
  machine: { cpu: os.cpus()[0]?.model, coeurs: os.cpus().length, memoireGo: Math.round(os.totalmem() / 2 ** 30),
    os: `${os.type()} ${os.release()}`, distribution: osName(), chargeMoyenne1min: os.loadavg()[0] },
  versions: { node: process.version, chromium: browser.browser, playwrightCore: pwVersion(), playwrightCoreChemin: process.env.PLAYWRIGHT_CORE ?? 'défaut',
    vite: version('vite'), svelte: version('svelte'), '@sveltejs/vite-plugin-svelte': version('@sveltejs/vite-plugin-svelte'),
    '@xyflow/svelte': version('@xyflow/svelte'), '@xyflow/system': version('@xyflow/system'), 'bpmn-js': version('bpmn-js'),
    'diagram-js': version('diagram-js'), elkjs: version('elkjs'), jsdom: version('jsdom') },
  scenes, ssr, navigateur: browser
};
const outPath = process.env.O3_OUT ?? new URL(`../evidence/${date}-o3-chromium-${String(browser.browser).split('.')[0]}.json`, import.meta.url).pathname;
writeFileSync(outPath, JSON.stringify(evidence, null, 2) + '\n');
log('preuve écrite :', outPath);

// Résumé lisible (stdout)
const kb = (o) => (o / 1000).toFixed(1);
console.log(`# O3 — ${date}, Chromium ${browser.browser}, témoin positif ${browser.controle?.valide ? 'valide' : 'INVALIDE'}`);
console.log('\n## Poids chargé par page (JS + CSS + autres, ko = 1000 o ; gzip niveau 6)\n');
console.log('| Page | JS brut | JS gzip | CSS brut | CSS gzip | Total brut | Total gzip |');
console.log('|---|---:|---:|---:|---:|---:|---:|');
for (const [k, p] of Object.entries(browser.pages)) {
  if (!k.endsWith(`@${Object.keys(scenes)[0]}`)) continue;
  const w = p.poids;
  console.log(`| ${p.page} | ${kb(w.js.octets)} | ${kb(w.js.gzip)} | ${kb(w.css.octets)} | ${kb(w.css.gzip)} | ${kb(w.total.octets)} | ${kb(w.total.gzip)} |`);
}
console.log('\n## Premier rendu, ms depuis le début de navigation (médiane [p25–p75], min–max)\n');
console.log('| Page | n | tReady | tRender | tPainted | runs ok | violations/run |');
console.log('|---|---:|---|---|---|---:|---|');
const f = (s) => (s ? `${s.median} [${s.p25}–${s.p75}] ${s.min}–${s.max}` : 'n/a');
for (const p of Object.values(browser.pages)) {
  console.log(`| ${p.page} | ${p.n} | ${f(p.stats?.tReady)} | ${f(p.stats?.tRender)} | ${f(p.stats?.tPainted)} | ${p.stats?.runsOk ?? 0}/${p.runs.length} | ${(p.stats?.violationsParRun ?? []).join(',')} |`);
}
