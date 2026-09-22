import Viewer from 'bpmn-js/lib/Viewer';
import './scene.css';
import { N, T, finish, fail } from './common.js';
fetch(`/scene-${N}.bpmn`).then((r) => r.text()).then(async (xml) => {
  T.data = T.start = performance.now();
  const viewer = new Viewer({ container: '#app' });
  const { warnings } = await viewer.importXML(xml);
  viewer.get('canvas').zoom('fit-viewport');
  finish(() => ({ nodes: document.querySelectorAll('.djs-shape').length,
    edges: document.querySelectorAll('.djs-connection').length, warnings: warnings.length }));
}).catch(fail);
