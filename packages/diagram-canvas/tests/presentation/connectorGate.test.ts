import { m3ProfileRegistry, shippedExecutorBindings } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

// The pure rule of the CI first-paint gate, applied here to model geometry.
import { connectorFindings } from "../../../../tools/diagram-first-paint/geometry.mjs";
import type { Rect } from "../../src/index.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../src/presentation/diagramCardModel.js";
import { layoutScene, resolveScene, scenePaintPlane, type SceneLayoutInput } from "../../src/presentation/diagramSceneModel.js";
import { flowFixture } from "../../test-support/flowFixture.js";
import { nestedZoneFixture } from "../../test-support/nestedZoneFixture.js";
import { hCondInput } from "../layout/dc2a/h-cond.js";

const measureLines = cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));
const box = (rect: Rect) => ({ left: rect.x, top: rect.y, right: rect.x + rect.width, bottom: rect.y + rect.height });

/** The gate's inputs for a scene: `legacy` paints every node after the connectors, as the hosts did. */
function gate(input: SceneLayoutInput, relations: readonly { occurrence: string; ends: readonly [string, string] }[] | undefined, legacy: boolean) {
  const result = layoutScene(input);
  if (result.status !== "laid-out") throw new Error("fixture refused: " + JSON.stringify(result.refusals));
  const scene = resolveScene(result, input);
  return connectorFindings({
    paths: scene.edges.map((edge) => ({ id: edge.occurrence, stroke: 0.75, points: edge.points })),
    labels: scene.labels.map((label) => label.occurrence),
    nodes: scene.nodes.map((node) => ({ id: node.occurrence, ...box(node.rect) })),
    occluders: [...scene.nodes.filter((node) => legacy || scenePaintPlane(node) === "box").map((node) => box(node.rect)),
      ...(legacy ? [] : scene.connectorCutouts.map(box))],
    relations, tolerance: 1,
  });
}

describe("first-paint connector gate on scene geometry", () => {
  for (const outside of [false, true]) {
    const fixture = nestedZoneFixture({ outside });
    const input = { ...fixture, measureLines, collapsed: [] };
    it(`should pass the nested-zone ERD view${outside ? " with a route leaving the zone" : ""}`, () => {
      expect(gate(input, fixture.relations, false)).toEqual([]);
    });
    it(`should fail it on the former paint order, every class relation hidden${outside ? " (route leaving the zone)" : ""}`, () => {
      const findings = gate(input, fixture.relations, true);
      expect(findings).toHaveLength(fixture.relations.length);
      for (const finding of findings) expect(finding).toMatch(/^connector occurrence:lnk-\d+ is hidden: 0 of /);
    });
  }

  for (const name of ["architecture", "ontology"] as const) for (const folded of [false, true]) {
    it(`should pass generic@2 ${name}/${folded ? "folded" : "unfolded"}`, () => {
      expect(gate(hCondInput(name, folded), undefined, false)).toEqual([]);
    });
  }

  for (const count of [3, 6]) {
    it(`should pass numbered flows with ${count} steps`, () => {
      const source = flowFixture(count, { labels: true, folded: true, reverse: true });
      expect(gate({ document: source.document, presentation: source.presentation, registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings, measureLines, collapsed: [], flows: { fanOutMax: 4 } }, undefined, false)).toEqual([]);
    });
  }
});
