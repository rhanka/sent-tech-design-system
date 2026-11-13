import { expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN, m3ProfileRegistry, shippedExecutorBindings,
  documentRef, entityRef, occurrenceRef, relationRef, type Entity, type Relation, type SemanticDocument,
} from "@sentropic/diagram-core";
import { rectsIntersect } from "../../src/index.js";
import { routesConflict } from "../../src/layout/route.js";
import { layoutScene, resolveScene } from "../../src/presentation/diagramSceneModel.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../src/presentation/diagramCardModel.js";

it("should comb a saturated labelled channel without losing labels or covering cards", () => {
  const entities: Record<string, Entity> = Object.fromEntries(["a", "b"].map(id => [entityRef(id), {
    id: entityRef(id), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: id } },
  }]));
  const relations: Record<string, Relation> = Object.fromEntries(Array.from({ length: 14 }, (_, index) => {
    const id = relationRef(`r${index}`);
    return [id, { id, profile: "generic@2", type: "link", endpoints: [
      { role: "source", target: entityRef("a") }, { role: "target", target: entityRef("b") },
    ], attributes: { label: { kind: "text", value: `a long channel label ${index} with additional explanation` } } }];
  }));
  const document: SemanticDocument = { documentId: documentRef("dense"), revision: 1,
    schemaVersion: CURRENT_SCHEMA_VERSION, profileRefs: ["generic@2"], typeDefinitions: {},
    entities, relations, ports: {}, resources: {}, extensions: [] };
  const input = { document, registry: m3ProfileRegistry, bindings: shippedExecutorBindings, collapsed: [],
    presentation: { contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN, categoryTokens: [], legends: {}, entities: {
      [occurrenceRef("e.a")]: { form: "card" as const, text: { title: "a" } },
      [occurrenceRef("e.b")]: { form: "card" as const, text: { title: "b" } },
    } }, measureLines: cardLineMeasurer(sceneCardMeasure(defaultCardMeasure)) };
  const result = layoutScene(input);
  if (result.status !== "laid-out") throw new Error(JSON.stringify(result));
  const scene = resolveScene(result, input);
  expect(scene.labels).toHaveLength(14);
  expect(result.warnings.filter(warning => warning.code === "label-unplaced" || warning.code === "route-obstructed")).toEqual([]);
  for (const [index, edge] of scene.edges.entries()) {
    for (const other of scene.edges.slice(index + 1)) expect(routesConflict(edge.points, other.points)).toBe(false);
  }
  for (const [index, label] of scene.labels.entries()) {
    for (const node of scene.nodes) expect(rectsIntersect(label.box, node.rect)).toBe(false);
    for (const other of scene.labels.slice(index + 1)) expect(rectsIntersect(label.box, other.box)).toBe(false);
  }
});
