/**
 * §2.9 W-DL0.13: `countBpmn` on synthetic vectors (prefixed names, default
 * namespace, a tag inside a comment, a tag inside CDATA, DTD refusal) and the
 * recorded `bpmn-selection.json` (validates; its selected row meets C1–C4
 * under the tie-break).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { countBpmn, BPMN_MODEL_NS, BPMN_DI_NS } from "../src/bpmn/xml-count.js";
import { selectBpmnFixture, criteriaOf, type BpmnCandidate } from "../src/bpmn/select.js";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));

const PREFIXED = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="${BPMN_MODEL_NS}" xmlns:bpmndi="${BPMN_DI_NS}" id="d">
  <bpmn:collaboration id="c1">
    <bpmn:participant id="p1" processRef="proc1"/>
    <bpmn:participant id="p2" processRef="proc2"/>
    <bpmn:messageFlow id="m1" sourceRef="p1" targetRef="p2"/>
  </bpmn:collaboration>
  <bpmn:process id="proc1">
    <bpmn:startEvent id="e1"/>
    <bpmn:userTask id="t1"/>
    <bpmn:exclusiveGateway id="g1"/>
    <bpmn:subProcess id="s1"><bpmn:task id="t2"/></bpmn:subProcess>
    <bpmn:callActivity id="ca1"/>
    <bpmn:boundaryEvent id="b1"><bpmn:eventDefinition id="ed1"/></bpmn:boundaryEvent>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="dia1"><bpmndi:BPMNPlane id="pl1"/></bpmndi:BPMNDiagram>
  <bpmndi:BPMNDiagram id="dia2"/>
</bpmn:definitions>`;

const DEFAULT_NS = `<definitions xmlns="${BPMN_MODEL_NS}" xmlns:di="${BPMN_DI_NS}">
  <collaboration id="c"><participant id="p1" processRef="x"/><participant id="p2" processRef="y"/></collaboration>
  <process id="x"><task id="t"/><transaction id="tr"/></process>
  <di:BPMNDiagram id="d1"/><di:BPMNDiagram id="d2"/><di:BPMNDiagram id="d3"/>
</definitions>`;

const COMMENT_CDATA = `<definitions xmlns="${BPMN_MODEL_NS}" xmlns:di="${BPMN_DI_NS}">
  <!-- <participant id="fake" processRef="x"/> <messageFlow id="fm"/> -->
  <process id="x"><task id="t1"/></process>
  <![CDATA[ <subProcess id="fake2"/> <di:BPMNDiagram id="fake3"/> ]]>
  <di:BPMNDiagram id="real1"/>
</definitions>`;

const DTD = `<!DOCTYPE definitions [<!ENTITY x "y">]>
<definitions xmlns="${BPMN_MODEL_NS}"><process id="x"/></definitions>`;

describe("W-DL0.13 countBpmn vectors", () => {
  it("prefixed names: pools, messageFlow, subProcess, diagrams and flow nodes counted", () => {
    const r = countBpmn(PREFIXED);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.counts.pools).toBe(2);
    expect(r.counts.messageFlows).toBe(1);
    expect(r.counts.subProcesses).toBe(1);
    expect(r.counts.diagrams).toBe(2);
    // startEvent, userTask, exclusiveGateway, subProcess, task (inside), callActivity, boundaryEvent = 7; eventDefinition excluded
    expect(r.counts.flowNodes).toBe(7);
  });

  it("default namespace resolves for unprefixed names", () => {
    const r = countBpmn(DEFAULT_NS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.counts.pools).toBe(2);
    expect(r.counts.subProcesses).toBe(1); // transaction
    expect(r.counts.diagrams).toBe(3);
    expect(r.counts.flowNodes).toBe(2); // task + transaction
  });

  it("tags inside comments and CDATA are not counted", () => {
    const r = countBpmn(COMMENT_CDATA);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.counts.pools).toBe(0);
    expect(r.counts.messageFlows).toBe(0);
    expect(r.counts.subProcesses).toBe(0);
    expect(r.counts.diagrams).toBe(1);
    expect(r.counts.flowNodes).toBe(1);
  });

  it("a DTD is refused", () => {
    const r = countBpmn(DTD);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("bpmn-dtd-refused");
  });

  it("malformed XML is unreadable", () => {
    const r = countBpmn("<definitions><process></definitions>");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("bpmn-xml-unreadable");
  });
});

describe("W-DL0.13 bpmn-selection.json", () => {
  const selectionPath = join(pkgRoot, "fixtures", "bpmn-selection.json");
  interface SelectionFile {
    readonly schema: string;
    readonly repository: string;
    readonly commit: string;
    readonly fileCount: number;
    readonly candidates: readonly BpmnCandidate[];
    readonly selected: { readonly path: string; readonly sha256: string } | null;
    readonly gap?: string;
  }
  const load = (): SelectionFile => JSON.parse(readFileSync(selectionPath, "utf8")) as SelectionFile;

  it("validates as ds.bpmn-selection/1 with the pinned commit and 55 candidates", () => {
    const sel = load();
    expect(sel.schema).toBe("ds.bpmn-selection/1");
    expect(sel.repository).toBe("@sentropic/bpmn-canvas");
    expect(sel.commit).toBe("05f737885bd44fddea84bf1b4d55ae5428704855");
    expect(sel.fileCount).toBe(55);
    expect(sel.candidates.length).toBe(55);
    for (const c of sel.candidates) {
      expect(/^[0-9a-f]{64}$/.test(c.sha256)).toBe(true);
      expect(c.bytes).toBeGreaterThan(0);
      expect(c.criteria).toEqual(criteriaOf(c.counts));
    }
  });

  it("the selection rule applied to the candidates reproduces the recorded outcome", () => {
    const sel = load();
    const eligible = sel.candidates.filter((c) => c.criteria.c1 && c.criteria.c2 && c.criteria.c3 && c.criteria.c4);
    const recomputed = selectBpmnFixture(sel.candidates);
    // the recorded selection is exactly what the rule gives
    expect(recomputed.selected?.path ?? null).toBe(sel.selected?.path ?? null);
    if (sel.selected === null) {
      // §2.8: no file meets all criteria -> source-gap, never an approximation
      expect(eligible.length).toBe(0);
      expect(sel.gap).toBe("no-file-meets-all-criteria");
      expect(recomputed.gap).toBe("no-file-meets-all-criteria");
      return;
    }
    const selected = sel.candidates.find((c) => c.path === sel.selected?.path);
    expect(selected).toBeDefined();
    if (selected === undefined) return;
    expect(selected.sha256).toBe(sel.selected.sha256);
    expect(selected.criteria).toEqual({ c1: true, c2: true, c3: true, c4: true });
    // tie-break: no eligible candidate has more flow nodes (then diagrams, then path)
    const maxFlow = Math.max(...eligible.map((c) => c.counts.flowNodes));
    expect(selected.counts.flowNodes).toBe(maxFlow);
    const atMax = eligible.filter((c) => c.counts.flowNodes === maxFlow);
    const maxDia = Math.max(...atMax.map((c) => c.counts.diagrams));
    expect(selected.counts.diagrams).toBe(maxDia);
  });
});
