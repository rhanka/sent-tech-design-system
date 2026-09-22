import { mount, flushSync } from 'svelte';
import StaticScene from './StaticScene.svelte';
import './scene.css';
import { N, T, finish, fail, staticCounts } from './common.js';
fetch(`/scene-${N}.placed.json`).then((r) => r.json()).then((view) => {
  T.data = T.start = performance.now();
  mount(StaticScene, { target: document.getElementById('app'), props: { view } });
  flushSync();
  finish(staticCounts);
}).catch(fail);
