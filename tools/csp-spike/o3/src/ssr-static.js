// Hydratation du repli statique rendu par svelte/server (voir o3/ssr.mjs).
import { hydrate, flushSync } from 'svelte';
import StaticScene from './StaticScene.svelte';
import './scene.css';
import { T, finish, fail, staticCounts } from './common.js';
try {
  const before = staticCounts();
  const view = JSON.parse(document.getElementById('scene-data').textContent);
  T.data = T.start = performance.now();
  hydrate(StaticScene, { target: document.getElementById('app'), props: { view } });
  flushSync();
  const tHydrated = performance.now();
  finish(() => ({ ...staticCounts(), tHydrated, beforeHydration: before }));
} catch (e) { fail(e); }
