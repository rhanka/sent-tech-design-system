import { describe, expect, it } from "vitest";
import {
  createDocument,
  createProcessFlowExtension,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  documentRef,
  entityRef,
  enumeration,
  m3ProfileRegistry,
  PROCESS_PROFILE_ID,
  quantity,
  relationRef,
  shippedExecutorBindings,
  text,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { cardLineMeasurer } from "../../src/presentation/diagramCardModel.js";
import {
  shippedSceneBindings,
  shippedSceneRegistry,
  validateSceneDocument,
  type ScenePresentation,
} from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";
import {
  measureProcessBox,
  renderProcessBoxSvg,
  renderProcessTable,
} from "../../src/presentation/process.js";

const emptyPresentation: ScenePresentation = {
  contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  entities: {},
  legends: {},
  categoryTokens: [],
};

function linearProcess(count: number): SemanticDocument {
  const base = createDocument({ documentId: documentRef(`p-${count}`), profileRefs: [PROCESS_PROFILE_ID] });
  const entities: Record<string, SemanticDocument["entities"][string]> = {};
  const relations: Record<string, SemanticDocument["relations"][string]> = {};
  for (let i = 0; i < count; i += 1) {
    const id = `s${i + 1}`;
    entities[`entity:${id}`] = {
      id: entityRef(id),
      profile: PROCESS_PROFILE_ID,
      type: "step",
      attributes: {
        name: text(`Step ${i + 1}`),
        kind: enumeration(i === 0 ? "start" : i === count - 1 ? "end" : "task"),
      },
    };
    if (i > 0) {
      const prev = `s${i}`;
      relations[`relation:${prev}.${id}`] = {
        id: relationRef(`${prev}.${id}`),
        profile: PROCESS_PROFILE_ID,
        type: "transition",
        endpoints: [
          { role: "source", target: entityRef(prev) },
          { role: "target", target: entityRef(id) },
        ],
        attributes: {},
      };
    }
  }
  return { ...base, entities, relations };
}

function branchingProcess(): SemanticDocument {
  const base = createDocument({ documentId: documentRef("branch"), profileRefs: [PROCESS_PROFILE_ID] });
  return {
    ...base,
    entities: {
      "entity:intake": { id: entityRef("intake"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Intake"), kind: enumeration("start") } },
      "entity:check": { id: entityRef("check"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Valid?"), kind: enumeration("decision") } },
      "entity:auto": { id: entityRef("auto"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Auto Approve"), kind: enumeration("subprocess") } },
      "entity:manual": { id: entityRef("manual"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Manual Review"), kind: enumeration("task") } },
      "entity:done": { id: entityRef("done"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Done"), kind: enumeration("end") } },
    },
    relations: {
      "relation:intake.check": { id: relationRef("intake.check"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("intake") }, { role: "target", target: entityRef("check") }], attributes: {} },
      "relation:check.auto": { id: relationRef("check.auto"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("check") }, { role: "target", target: entityRef("auto") }], attributes: { label: text("Yes"), emphasis: enumeration("emphasis") } },
      "relation:check.manual": { id: relationRef("check.manual"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("check") }, { role: "target", target: entityRef("manual") }], attributes: { label: text("No") } },
      "relation:auto.done": { id: relationRef("auto.done"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("auto") }, { role: "target", target: entityRef("done") }], attributes: {} },
      "relation:manual.done": { id: relationRef("manual.done"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("manual") }, { role: "target", target: entityRef("done") }], attributes: {} },
    },
    extensions: [createProcessFlowExtension({ direction: "LR" })],
  };
}

function retryProcess(): SemanticDocument {
  const base = createDocument({ documentId: documentRef("retry"), profileRefs: [PROCESS_PROFILE_ID] });
  return {
    ...base,
    entities: {
      "entity:s1": { id: entityRef("s1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Draft"), kind: enumeration("start") } },
      "entity:s2": { id: entityRef("s2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Validate"), kind: enumeration("task") } },
      "entity:s3": { id: entityRef("s3"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Publish"), kind: enumeration("end") } },
    },
    relations: {
      "relation:s2.s1": { id: relationRef("s2.s1"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s2") }, { role: "target", target: entityRef("s1") }], attributes: { label: text("Retry"), kind: enumeration("retry") } },
      "relation:s1.s2": { id: relationRef("s1.s2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("s2") }], attributes: {} },
      "relation:s2.s3": { id: relationRef("s2.s3"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s2") }, { role: "target", target: entityRef("s3") }], attributes: {} },
    },
  };
}

function twoLaneProcess(): SemanticDocument {
  const base = createDocument({ documentId: documentRef("two-lanes"), profileRefs: [PROCESS_PROFILE_ID] });
  return {
    ...base,
    entities: {
      "entity:l1": { id: entityRef("l1"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Requester"), order: quantity(0, "index") } },
      "entity:l2": { id: entityRef("l2"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Approver"), order: quantity(1, "index") } },
      "entity:a": { id: entityRef("a"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Submit <Form>"), kind: enumeration("start") } },
      "entity:b": { id: entityRef("b"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Approve"), kind: enumeration("end"), subtitle: text("Manager") } },
    },
    relations: {
      "relation:l1.a": { id: relationRef("l1.a"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l1") }, { role: "step", target: entityRef("a") }], attributes: {} },
      "relation:l2.b": { id: relationRef("l2.b"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l2") }, { role: "step", target: entityRef("b") }], attributes: {} },
      "relation:a.b": { id: relationRef("a.b"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("a") }, { role: "target", target: entityRef("b") }], attributes: { label: text("Route") } },
    },
  };
}

describe("presentation/process.ts and renderSceneSvg dispatch (L1c)", () => {
  it("measures and renders step variants through resolved notation with 14px centred text and no icon or fold chrome", () => {
    const doc = branchingProcess();
    for (const [id, expectedAttr] of [
      ["entity:intake", 'data-process-variant="start"'],
      ["entity:check", 'data-process-variant="decision"'],
      ["entity:auto", 'data-process-variant="subprocess"'],
      ["entity:manual", 'data-process-variant="task"'],
      ["entity:done", 'data-process-variant="end"'],
    ] as const) {
      const box = measureProcessBox(doc, entityRef(id.slice(7)), { stepNumber: "1", measureLines: cardLineMeasurer() });
      const svg = renderProcessBoxSvg(box);
      expect(svg).toContain(expectedAttr);
      expect(svg).toContain('font-size="14"');
      expect(svg).toContain('text-anchor="middle"');
      expect(svg).toContain('data-process-step-badge=""');
      expect(svg).not.toContain("st-diagramCard-icon");
      expect(svg).not.toContain("data-toggle");
    }
  });

  it("renders static SVG goldens for 3-step LR, 5-step TB (at 640px), branching, retry loop, and two lanes", () => {
    const render = (doc: SemanticDocument, targetWidth = 640) =>
      renderSceneSvg({
        document: doc,
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
        presentation: emptyPresentation,
        measureLines: cardLineMeasurer(),
        collapsed: [],
        targetWidth,
      });

    const three = render(linearProcess(3), 640);
    expect(three.result.status).toBe("laid-out");
    if (three.result.status === "laid-out") expect(three.result.fit.direction).toBe("left-to-right");
    expect(three.svg).toContain('data-display-scale="1"');
    expect(three.svg).toContain('data-connector-mode="r7"');
    expect(three.svg).not.toContain("st-diagramCard-icon");
    expect(three.svg).not.toContain("data-toggle");
    expect(three.svg.match(/data-process-step-badge=""/g)).toHaveLength(3);
    // Deterministic SVG bytes across repeated runs
    expect(render(linearProcess(3), 640).svg).toBe(three.svg);

    const five = render(linearProcess(5), 640);
    expect(five.result.status).toBe("laid-out");
    if (five.result.status === "laid-out") expect(five.result.fit.direction).toBe("top-to-bottom");
    const scaleMatch = /data-display-scale="([^"]+)"/.exec(five.svg);
    expect(Number(scaleMatch?.[1])).toBeGreaterThanOrEqual(0.9);
    expect(five.svg.match(/data-process-step-badge=""/g)).toHaveLength(5);

    const branch = render(branchingProcess(), 1440);
    expect(branch.svg).toContain('data-process-variant="decision"');
    expect(branch.svg).toContain('data-process-variant="subprocess"');
    expect(branch.svg).toContain(">3a<");
    expect(branch.svg).toContain(">3b<");
    expect(branch.svg).toContain('data-edge-emphasis="emphasis"');

    const retry = render(retryProcess(), 640);
    expect(retry.svg).toContain('data-edge-stroke="dashed"');
    expect(retry.svg).toContain("Retry");

    const lanes = render(twoLaneProcess(), 640);
    expect(lanes.svg).toContain('data-process-lane="Requester"');
    expect(lanes.svg).toContain('data-process-lane="Approver"');
    expect(lanes.svg).toContain("Submit &lt;Form&gt;");
    // Frame (lanes) renders before connectors, connectors before boxes
    expect(lanes.svg.indexOf('data-process-lane=')).toBeLessThan(lanes.svg.indexOf('data-scene-connectors='));
  });

  it("renders an accessible escaped step table", () => {
    const html = renderProcessTable(twoLaneProcess());
    expect(html).toContain('<details class="st-diagramProcessTable">');
    expect(html).toContain("<table");
    expect(html).toContain('<th scope="col">Step</th>');
    expect(html).toContain('<th scope="col">Lane</th>');
    expect(html).toContain('<th scope="col">Action</th>');
    expect(html).toContain('<th scope="col">Next / Condition</th>');
    expect(html).toContain("Requester");
    expect(html).toContain("Submit &lt;Form&gt;");
    expect(html).toContain("Approve");
  });

  it("exports the non-generic@1 validateSceneDocument / shippedSceneRegistry / shippedSceneBindings bridge from diagramSceneModel", () => {
    expect(shippedSceneRegistry.has("generic@1")).toBe(false);
    expect(shippedSceneRegistry.has("process@1")).toBe(true);
    expect(shippedSceneRegistry.has("erd@1")).toBe(true);
    expect(shippedSceneBindings.rows.some((r) => r.profileId === "generic@1")).toBe(false);
    expect(shippedSceneBindings.rows.some((r) => r.profileId === "process@1")).toBe(true);
    expect(validateSceneDocument(linearProcess(3))).toEqual([]);
    const invalid = linearProcess(3);
    const broken: SemanticDocument = {
      ...invalid,
      relations: {
        ...invalid.relations,
        "relation:s1.missing": {
          id: relationRef("s1.missing"),
          profile: PROCESS_PROFILE_ID,
          type: "transition",
          endpoints: [
            { role: "source", target: entityRef("s1") },
            { role: "target", target: entityRef("missing") },
          ],
          attributes: {},
        },
      },
    };
    expect(validateSceneDocument(broken).map((d) => d.code)).toContain("dangling-reference");
  });
});
