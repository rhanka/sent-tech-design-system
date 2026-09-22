import BpmnViewer from 'bpmn-js/lib/Viewer';

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="Start_1" name="Demande"><bpmn:outgoing>Flow_1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:task id="Task_1" name="Instruire le dossier"><bpmn:incoming>Flow_1</bpmn:incoming><bpmn:outgoing>Flow_2</bpmn:outgoing></bpmn:task>
    <bpmn:exclusiveGateway id="Gate_1" name="Recevable ?"><bpmn:incoming>Flow_2</bpmn:incoming><bpmn:outgoing>Flow_3</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:endEvent id="End_1" name="Clos"><bpmn:incoming>Flow_3</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gate_1" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Gate_1" targetRef="End_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Diagram_1"><bpmndi:BPMNPlane id="Plane_1" bpmnElement="Process_1">
    <bpmndi:BPMNShape id="S_Start" bpmnElement="Start_1"><dc:Bounds x="150" y="100" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="S_Task" bpmnElement="Task_1"><dc:Bounds x="240" y="78" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="S_Gate" bpmnElement="Gate_1" isMarkerVisible="true"><dc:Bounds x="400" y="93" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="S_End" bpmnElement="End_1"><dc:Bounds x="510" y="100" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="E_1" bpmnElement="Flow_1"><di:waypoint x="186" y="118" /><di:waypoint x="240" y="118" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="E_2" bpmnElement="Flow_2"><di:waypoint x="340" y="118" /><di:waypoint x="400" y="118" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="E_3" bpmnElement="Flow_3"><di:waypoint x="450" y="118" /><di:waypoint x="510" y="118" /></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const viewer = new BpmnViewer({ container: '#canvas' });
const t0 = performance.now();
viewer.importXML(XML).then(({ warnings }) => {
  viewer.get('canvas').zoom('fit-viewport');
  const wm = document.querySelector('.bjs-powered-by');
  const r = wm && wm.getBoundingClientRect();
  window.__result = {
    ok: true, ms: Math.round(performance.now() - t0), warnings: (warnings || []).length,
    elements: document.querySelectorAll('.djs-element').length,
    watermark: wm ? { present: true, visible: getComputedStyle(wm).visibility, opacity: getComputedStyle(wm).opacity,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      href: wm.getAttribute('href'), zIndex: getComputedStyle(wm).zIndex } : { present: false }
  };
}).catch((err) => { window.__result = { ok: false, error: String(err) }; });
