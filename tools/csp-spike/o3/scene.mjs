// Scènes déterministes du protocole O3, et placement serveur (moitié Node du repli
// « SVG statique »). Une même scène alimente les cinq candidats :
//   - vue placée JSON  → SVG statique (vanilla et Svelte), xyflow ;
//   - entrée ELK brute → elkjs côté client ;
//   - BPMN XML + DI    → bpmn-js Viewer et Modeler (mêmes positions, mêmes tracés).
import ELK from 'elkjs/lib/elk.bundled.js';
import { writeFileSync, mkdirSync } from 'node:fs';

export const SIZES = [35, 200];
export const NODE_W = 120;
export const NODE_H = 48;

// Arbre binaire + arêtes transverses (i-4 → i, tous les 5 nœuds) : DAG sans doublon.
export function sceneInput(n) {
  const children = [];
  const edges = [];
  for (let i = 0; i < n; i++) {
    children.push({ id: `n${i}`, width: NODE_W, height: NODE_H, labels: [{ text: `Étape ${i + 1}` }] });
  }
  for (let i = 1; i < n; i++) {
    const p = Math.floor((i - 1) / 2);
    edges.push({ id: `e${p}_${i}`, sources: [`n${p}`], targets: [`n${i}`] });
  }
  for (let i = 5; i < n; i += 5) edges.push({ id: `x${i - 4}_${i}`, sources: [`n${i - 4}`], targets: [`n${i}`] });
  return {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered', 'elk.direction': 'RIGHT', 'elk.edgeRouting': 'ORTHOGONAL',
      'elk.padding': '[top=20,left=20,bottom=20,right=20]',
      'elk.spacing.nodeNode': '24', 'elk.layered.spacing.nodeNodeBetweenLayers': '48'
    },
    children, edges
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function toBpmn(view) {
  const out = new Map(); const inc = new Map();
  for (const e of view.edges) {
    (out.get(e.sources[0]) ?? out.set(e.sources[0], []).get(e.sources[0])).push(e.id);
    (inc.get(e.targets[0]) ?? inc.set(e.targets[0], []).get(e.targets[0])).push(e.id);
  }
  const tasks = view.children.map((n) => `    <bpmn:task id="${n.id}" name="${esc(n.labels[0].text)}">`
    + (inc.get(n.id) ?? []).map((id) => `<bpmn:incoming>${id}</bpmn:incoming>`).join('')
    + (out.get(n.id) ?? []).map((id) => `<bpmn:outgoing>${id}</bpmn:outgoing>`).join('')
    + '</bpmn:task>').join('\n');
  const flows = view.edges.map((e) => `    <bpmn:sequenceFlow id="${e.id}" sourceRef="${e.sources[0]}" targetRef="${e.targets[0]}" />`).join('\n');
  const shapes = view.children.map((n) => `      <bpmndi:BPMNShape id="${n.id}_di" bpmnElement="${n.id}"><dc:Bounds x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" /></bpmndi:BPMNShape>`).join('\n');
  const conns = view.edges.map((e) => {
    const s = e.sections[0];
    const pts = [s.startPoint, ...(s.bendPoints ?? []), s.endPoint];
    return `      <bpmndi:BPMNEdge id="${e.id}_di" bpmnElement="${e.id}">${pts.map((p) => `<di:waypoint x="${p.x}" y="${p.y}" />`).join('')}</bpmndi:BPMNEdge>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Defs_O3" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="P_O3" isExecutable="false">
${tasks}
${flows}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Dg_O3"><bpmndi:BPMNPlane id="Pl_O3" bpmnElement="P_O3">
${shapes}
${conns}
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
}

export async function place(n) {
  return new ELK().layout(sceneInput(n));
}

// Écrit les données servies aux pages (publicDir de la config O3).
export async function writeScenes(dir = new URL('./public/', import.meta.url)) {
  mkdirSync(dir, { recursive: true });
  const summary = {};
  for (const n of SIZES) {
    const input = sceneInput(n);
    const view = await place(n);
    const files = {
      [`scene-${n}.elk.json`]: JSON.stringify(input),
      [`scene-${n}.placed.json`]: JSON.stringify(view),
      [`scene-${n}.bpmn`]: toBpmn(view)
    };
    for (const [f, body] of Object.entries(files)) writeFileSync(new URL(f, dir), body);
    summary[n] = { nodes: view.children.length, edges: view.edges.length,
      box: [Math.round(view.width), Math.round(view.height)],
      bytes: Object.fromEntries(Object.entries(files).map(([f, b]) => [f, Buffer.byteLength(b)])) };
  }
  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(await writeScenes(), null, 2));
