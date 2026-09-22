import Modeler from 'bpmn-js/lib/Modeler';
import './scene.css';
import { N, T, finish, fail } from './common.js';
fetch(`/scene-${N}.bpmn`).then((r) => r.text()).then(async (xml) => {
  T.data = T.start = performance.now();
  const modeler = new Modeler({ container: '#app' });
  const { warnings } = await modeler.importXML(xml);
  modeler.get('canvas').zoom('fit-viewport');
  finish(() => ({ nodes: document.querySelectorAll('.djs-shape').length,
    edges: document.querySelectorAll('.djs-connection').length, warnings: warnings.length }));
}).catch(fail);
