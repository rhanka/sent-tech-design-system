// Hydratation de xyflow rendu par svelte/server (sized=true, voir o3/ssr.mjs).
import { hydrate } from 'svelte';
import XyflowScene from './XyflowScene.svelte';
import './scene.css';
import { N, T, finish, fail, whenXyflowComplete, xyflowCounts } from './common.js';
const host = document.getElementById('app');
try {
  const before = xyflowCounts(host);
  const view = JSON.parse(document.getElementById('scene-data').textContent);
  let tInit = null;
  T.data = T.start = performance.now();
  hydrate(XyflowScene, { target: host, props: { view, sized: true, oninit: () => { tInit = performance.now(); } } });
  const tHydrated = performance.now();
  whenXyflowComplete(host, view.children.length, view.edges.length, 3000, true)
    .then(() => finish(() => ({ ...xyflowCounts(host), tInit, tHydrated, beforeHydration: before })))
    .catch((e) => { window.__result = { ok: false, n: N, error: String(e), tStart: T.start, tHydrated, ...xyflowCounts(host), beforeHydration: before }; });
} catch (e) { fail(e); }
