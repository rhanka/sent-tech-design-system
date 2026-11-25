import { render, cleanup } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
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
} from "../../../diagram-core/dist/index.js";
import DiagramSceneFigure from "./DiagramSceneFigure.svelte";
import type { DiagramSceneFigureProps } from "./DiagramSceneFigure.svelte";

afterEach(cleanup);

function processBranchingWithLanes(): SemanticDocument {
  const base = createDocument({ documentId: documentRef("svelte-process-branch"), profileRefs: [PROCESS_PROFILE_ID] });
  return {
    ...base,
    entities: {
      "entity:laneFront": { id: entityRef("laneFront"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Front Office"), order: quantity(0, "index") } },
      "entity:laneBack": { id: entityRef("laneBack"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Back Office"), order: quantity(1, "index") } },
      "entity:s1": { id: entityRef("s1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Intake"), kind: enumeration("start") } },
      "entity:s2": { id: entityRef("s2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Check?"), kind: enumeration("decision") } },
      "entity:s3": { id: entityRef("s3"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Approve"), kind: enumeration("task") } },
      "entity:s4": { id: entityRef("s4"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Close"), kind: enumeration("end") } },
    },
    relations: {
      "relation:laneFront.s1": { id: relationRef("laneFront.s1"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("laneFront") }, { role: "step", target: entityRef("s1") }], attributes: {} },
      "relation:laneBack.s2": { id: relationRef("laneBack.s2"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("laneBack") }, { role: "step", target: entityRef("s2") }], attributes: {} },
      "relation:laneBack.s3": { id: relationRef("laneBack.s3"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("laneBack") }, { role: "step", target: entityRef("s3") }], attributes: {} },
      "relation:laneFront.s4": { id: relationRef("laneFront.s4"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("laneFront") }, { role: "step", target: entityRef("s4") }], attributes: {} },
      "relation:s1.s2": { id: relationRef("s1.s2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("s2") }], attributes: {} },
      "relation:s2.s3": { id: relationRef("s2.s3"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s2") }, { role: "target", target: entityRef("s3") }], attributes: { label: text("OK") } },
      "relation:s3.s2": { id: relationRef("s3.s2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s3") }, { role: "target", target: entityRef("s2") }], attributes: { label: text("Retry"), kind: enumeration("retry") } },
      "relation:s3.s4": { id: relationRef("s3.s4"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s3") }, { role: "target", target: entityRef("s4") }], attributes: {} },
    },
    extensions: [createProcessFlowExtension({ direction: "LR" })],
  };
}

describe("process@1 Svelte host", () => {
  it("renders simple process boxes, swimlanes, edges, and step table fallback without card icons or toggles", async () => {
    const document = processBranchingWithLanes();
    const mounted = render(DiagramSceneFigure, {
      document,
      presentation: { contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN, entities: {}, legends: {}, categoryTokens: [] },
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      title: "Branching process",
    });
    await tick();
    const root = mounted.container;
    expect(root.querySelector("[data-scene-refused]")).toBeNull();
    expect(root.querySelector("figure")?.getAttribute("data-zoom")).toBe("1");
    expect(root.querySelector("figure")?.getAttribute("data-zoom-readout")).toBe("100");
    expect(root.querySelectorAll('[data-scene-kind="process"]')).toHaveLength(6);
    expect(root.querySelectorAll(".st-diagramProcess-svg svg .st-diagramProcessBox")).toHaveLength(4);
    expect(root.querySelectorAll(".st-diagramProcess-svg svg .st-diagramProcessLane")).toHaveLength(2);
    expect(root.querySelectorAll("[data-scene-edge]")).toHaveLength(4);
    expect(root.querySelector('[data-edge-stroke="dashed"]')).not.toBeNull();
    expect(root.querySelector(".st-diagramCard-icon")).toBeNull();
    expect(root.querySelector("[data-toggle]")).toBeNull();
    expect(root.querySelectorAll(".st-diagramProcess-fallback details.st-diagramProcessTable tbody tr")).toHaveLength(4);
  });
});
