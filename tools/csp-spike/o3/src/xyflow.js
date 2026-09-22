import { mount } from 'svelte';
import XyflowScene from './XyflowScene.svelte';
import './scene.css';
import { N, T, finish, fail, whenXyflowComplete, xyflowCounts } from './common.js';
fetch(`/scene-${N}.placed.json`).then((r) => r.json()).then(async (view) => {
  const host = document.getElementById('app');
  let tInit = null;
  T.data = T.start = performance.now();
  mount(XyflowScene, { target: host, props: { view, sized: false, oninit: () => { tInit = performance.now(); } } });
  await whenXyflowComplete(host, view.children.length, view.edges.length);
  finish(() => ({ ...xyflowCounts(host), tInit }));
}).catch(fail);
