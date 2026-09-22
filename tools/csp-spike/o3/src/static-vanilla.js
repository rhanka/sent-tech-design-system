import './scene.css';
import { N, T, finish, fail, staticCounts } from './common.js';
import { renderVanilla } from './render-vanilla.js';
fetch(`/scene-${N}.placed.json`).then((r) => r.json()).then((view) => {
  T.data = T.start = performance.now();
  renderVanilla(view, document.getElementById('app'));
  finish(staticCounts);
}).catch(fail);
