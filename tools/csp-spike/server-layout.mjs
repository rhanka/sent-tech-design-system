import ELK from './node_modules/elkjs/lib/elk.bundled.js';
import { writeFileSync } from 'node:fs';
const graph = {
  id: 'root', layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT', 'elk.padding': '[top=20,left=20,bottom=20,right=20]' },
  children: [
    { id: 'g1', layoutOptions: { 'elk.algorithm': 'layered' }, children: [{ id: 'a', width: 90, height: 40, labels: [{ text: 'Collecte' }] }, { id: 'b', width: 90, height: 40, labels: [{ text: 'Contrôle' }] }], edges: [{ id: 'e_ab', sources: ['a'], targets: ['b'] }] },
    { id: 'g2', layoutOptions: { 'elk.algorithm': 'layered' }, children: [{ id: 'c', width: 90, height: 40, labels: [{ text: 'Décision' }] }, { id: 'd', width: 90, height: 40, labels: [{ text: 'Publication' }] }], edges: [{ id: 'e_cd', sources: ['c'], targets: ['d'] }] }
  ],
  edges: [{ id: 'e_g', sources: ['b'], targets: ['c'] }]
};
const t0 = Date.now();
const placed = await new ELK().layout(graph);
const json = JSON.stringify(placed);
writeFileSync(new URL('./placed-view.json', import.meta.url), json);
console.log(JSON.stringify({ msNode: Date.now() - t0, bytes: Buffer.byteLength(json), hasCoords: placed.children.every(c => typeof c.x === 'number') }));
