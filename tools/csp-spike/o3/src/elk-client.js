// Placeur embarqué côté client : elkjs place la scène, puis même rendu que le repli statique.
import ELK from 'elkjs/lib/elk.bundled.js';
import './scene.css';
import { N, T, finish, fail, staticCounts } from './common.js';
import { renderVanilla } from './render-vanilla.js';
fetch(`/scene-${N}.elk.json`).then((r) => r.json()).then(async (graph) => {
  T.data = T.start = performance.now();
  const view = await new ELK().layout(graph);
  const tLayout = performance.now() - T.start;
  renderVanilla(view, document.getElementById('app'));
  finish(() => ({ ...staticCounts(), tLayout }));
}).catch(fail);
