import BpmnModeler from 'bpmn-js/lib/Modeler';

const EMPTY = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="D1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="P1" isExecutable="false"><bpmn:startEvent id="S1" name="Debut" /></bpmn:process>
  <bpmndi:BPMNDiagram id="Dg1"><bpmndi:BPMNPlane id="Pl1" bpmnElement="P1">
    <bpmndi:BPMNShape id="Sh1" bpmnElement="S1"><dc:Bounds x="180" y="120" width="36" height="36" /></bpmndi:BPMNShape>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>`;

const modeler = new BpmnModeler({ container: '#canvas' });
window.__modeler = modeler;
modeler.importXML(EMPTY).then(async () => {
  const steps = [];
  const el = modeler.get('elementRegistry').get('S1');
  // sélection : diagram-js dessine des poignées de sélection
  modeler.get('selection').select(el); steps.push('select');
  // création par palette : append d'une tâche (drag simulé par la modélisation directe)
  const modeling = modeler.get('modeling');
  const task = modeling.appendShape(el, { type: 'bpmn:Task' }, { x: 320, y: 138 });
  steps.push('appendShape');
  // édition directe du libellé : overlay textarea positionné en style inline
  modeler.get('directEditing').activate(task); steps.push('directEditing');
  await new Promise((r) => setTimeout(r, 150));
  const active = modeler.get('directEditing').isActive();
  modeler.get('directEditing').cancel();
  // survol : diagram-js ajoute des marqueurs
  modeler.get('canvas').zoom('fit-viewport');
  const { xml } = await modeler.saveXML({ format: true });
  const wm = document.querySelector('.bjs-powered-by');
  window.__result = { ok: true, steps, directEditingActive: active,
    elements: document.querySelectorAll('.djs-element').length,
    xmlRoundTrip: /<[a-zA-Z0-9]*:?[Tt]ask/.test(xml), xmlHead: xml.split('\n').slice(0,3).join(' ').slice(0,150),
    watermarkVisible: !!wm && getComputedStyle(wm).visibility === 'visible' };
}).catch((e) => { window.__result = { ok: false, error: String(e) }; });
