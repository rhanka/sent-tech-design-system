import { describe, expect, it } from "vitest";
import {
  createView,
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  viewRef,
} from "@sentropic/diagram-core";
import { cardLineMeasurer, defaultCardMeasure } from "../../src/presentation/diagramCardModel.js";
import {
  layoutScene,
  resolveScene,
  resolveScenePresentation,
  type SceneDocument,
  type ScenePresentation,
  type SceneView,
} from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";
import { ownerInput } from "../layout/dc2a/owner-fixtures.js";

/**
 * DE-1 owner addendum 1 — the scene stamps nesting depth from the view
 * groups onto zone entries, so frames alternate without page code. Cards
 * are untouched; entries pinning their own depth keep it.
 */
describe("diagram depth stamping (DE-1 addendum 1)", () => {
  const view = {
    ...createView({ viewId: viewRef("v"), semanticDocumentId: "document:d" as never }),
    entityOccurrences: {
      "occurrence:top": { id: "occurrence:top", entity: "entity:top" },
      "occurrence:nested": { id: "occurrence:nested", entity: "entity:nested", group: "group:nested" },
      "occurrence:leaf": { id: "occurrence:leaf", entity: "entity:leaf", group: "group:leaf" },
    },
    groups: {
      "group:nested": { id: "group:nested", occurrence: "occurrence:top" },
      "group:leaf": { id: "group:leaf", occurrence: "occurrence:nested" },
    },
  } as unknown as SceneView;
  const document = { entities: {} } as unknown as SceneDocument;
  const presentation = {
    entities: {
      "occurrence:top": { form: "container", text: { title: "Top" } },
      "occurrence:nested": { form: "container", text: { title: "Nested" } },
      "occurrence:leaf": { form: "card", text: { title: "Leaf" } },
    },
  } as unknown as ScenePresentation;

  it("should stamp group depth onto zone entries and leave cards alone", () => {
    const resolved = resolveScenePresentation(document, presentation, {}, true, view);
    const entities = resolved.presentation.entities as Record<string, { depth?: number }>;
    // Lean stamps: the top level needs no key (absent means `0`).
    expect("depth" in (entities["occurrence:top"] as object)).toBe(false);
    expect(entities["occurrence:nested"]?.depth).toBe(1);
    // Cards carry no depth pin: their semantic tints never change.
    expect("depth" in (resolved.presentation.entities["occurrence:leaf"] as object)).toBe(false);
  });

  it("should keep an explicitly pinned depth and stamp the selected start parity", () => {
    const pinned = {
      entities: {
        ...presentation.entities,
        "occurrence:nested": { ...presentation.entities["occurrence:nested"], depth: 7 },
      },
    } as never;
    const kept = resolveScenePresentation(document, pinned, {}, true, view);
    expect((kept.presentation.entities["occurrence:nested"] as { depth?: number }).depth).toBe(7);
    const flipped = resolveScenePresentation(document, presentation, {}, true, view, undefined, {
      depthParityStart: 1,
    });
    for (const entry of Object.values(flipped.presentation.entities)) {
      const zone = entry as { form?: string; depthParityStart?: 0 | 1 };
      if (zone.form === "container") expect(zone.depthParityStart).toBe(1);
    }
    // An explicitly pinned depth still inherits a non-default scene depthParityStart.
    const pinnedAndFlipped = resolveScenePresentation(document, pinned, {}, true, view, undefined, {
      depthParityStart: 1,
    });
    expect((pinnedAndFlipped.presentation.entities["occurrence:nested"] as { depth?: number; depthParityStart?: 0 | 1 })).toMatchObject({
      depth: 7,
      depthParityStart: 1,
    });
  });

  it("should stamp nesting depth and start parity on viewless/synthesized scenes across fold and SVG render", () => {
    const nestedDoc = {
      documentId: "document:viewless-nested",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        "entity:outer": { id: entityRef("outer"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Outer" } } },
        "entity:inner": { id: entityRef("inner"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Inner" } } },
        "entity:leaf": { id: entityRef("leaf"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Leaf" } } },
      },
      relations: {
        "relation:c1": {
          id: relationRef("c1"),
          profile: "generic@2",
          type: "contains",
          endpoints: [
            { role: "parent", target: entityRef("outer") },
            { role: "child", target: entityRef("inner") },
          ],
          attributes: {},
        },
        "relation:c2": {
          id: relationRef("c2"),
          profile: "generic@2",
          type: "contains",
          endpoints: [
            { role: "parent", target: entityRef("inner") },
            { role: "child", target: entityRef("leaf") },
          ],
          attributes: {},
        },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SceneDocument;
    const nestedPres = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        "occurrence:e.outer": { form: "container", text: { title: "Outer" } },
        "occurrence:e.inner": { form: "container", text: { title: "Inner" } },
        "occurrence:e.leaf": { form: "card", text: { title: "Leaf", body: "Work" } },
      },
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation;

    const viewless = resolveScenePresentation(nestedDoc, nestedPres);
    const entities = viewless.presentation.entities as Record<string, { depth?: number; depthParityStart?: 0 | 1 }>;
    expect("depth" in (entities["occurrence:e.outer"] as object)).toBe(false);
    expect(entities["occurrence:e.inner"]?.depth).toBe(1);
    expect("depth" in (entities["occurrence:e.leaf"] as object)).toBe(false);

    // Synthesized view scene: depth stamps survive initial render AND fold/unfold.
    const measureLines = cardLineMeasurer(defaultCardMeasure);
    for (const collapsed of [[], [occurrenceRef("e.inner")]]) {
      const laidOut = layoutScene({
        document: nestedDoc,
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
        presentation: nestedPres,
        measureLines,
        collapsed,
      });
      expect(laidOut.status).toBe("laid-out");
      if (laidOut.status !== "laid-out") return;
      const scene = resolveScene(laidOut, {
        document: nestedDoc,
        presentation: nestedPres,
        measureLines,
      });
      const innerNode = scene.nodes.find((node) => node.occurrence === "occurrence:e.inner");
      expect(innerNode?.presentation?.depth).toBe(1);
    }

    // Standalone SVG fallback: defines surface-2 / surface-subtle so odd zones never paint black.
    const rendered = renderSceneSvg({
      document: nestedDoc,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: nestedPres,
      measureLines,
      collapsed: [],
    });
    expect(rendered.svg).toContain("svg:root{");
    expect(rendered.svg).not.toMatch(/[^:]svg\{/);
    expect(rendered.svg).toContain("--st-semantic-surface-subtle:#f8fafc");
    expect(rendered.svg).toContain("--st-component-diagramZone-surface2:#f8fafc");
    expect(rendered.svg).toContain("--st-component-diagramZone-surface2");

    // Existing flat viewless fixture stays lean at depth 0 when default parity applies.
    const input = ownerInput("vue-globale");
    const resolvedOwner = resolveScenePresentation(input.document, input.presentation);
    for (const entry of Object.values(resolvedOwner.presentation.entities)) {
      expect("depthParityStart" in (entry as object)).toBe(false);
    }
  });

  it("should stamp 3-level viewless/v2 depth surfaces and paint surface2 in renderSceneSvg across fold and depthParityStart", () => {
    const deepDoc = {
      documentId: "document:deep-svg-surface2",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        "entity:l0": { id: entityRef("l0"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Level 0" } } },
        "entity:l1": { id: entityRef("l1"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Level 1" } } },
        "entity:l2": { id: entityRef("l2"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Level 2" } } },
        "entity:leaf": { id: entityRef("leaf"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Leaf" } } },
      },
      relations: {
        "relation:c1": { id: relationRef("c1"), profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("l0") }, { role: "child", target: entityRef("l1") }], attributes: {} },
        "relation:c2": { id: relationRef("c2"), profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("l1") }, { role: "child", target: entityRef("l2") }], attributes: {} },
        "relation:c3": { id: relationRef("c3"), profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("l2") }, { role: "child", target: entityRef("leaf") }], attributes: {} },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SceneDocument;
    const deepPres = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        "occurrence:e.l0": { form: "container", text: { title: "L0" }, anatomy: "v2" },
        "occurrence:e.l1": { form: "container", text: { title: "L1" }, anatomy: "v2" },
        "occurrence:e.l2": { form: "container", text: { title: "L2" }, anatomy: "v2" },
        "occurrence:e.leaf": { form: "card", text: { title: "Leaf", body: "Work" }, anatomy: "v2" },
      },
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation;
    const measureLines = cardLineMeasurer(defaultCardMeasure);

    // View-without-groups fallback stamps semantic nesting depth (0, 1, 2).
    const grouplessView = {
      ...createView({ viewId: viewRef("groupless"), semanticDocumentId: deepDoc.documentId, revision: 1 }),
      entityOccurrences: {
        "occurrence:e.l0": { id: occurrenceRef("e.l0"), entity: entityRef("l0"), geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.l1": { id: occurrenceRef("e.l1"), entity: entityRef("l1"), geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.l2": { id: occurrenceRef("e.l2"), entity: entityRef("l2"), geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.leaf": { id: occurrenceRef("e.leaf"), entity: entityRef("leaf"), geometry: { x: 0, y: 0, width: 352, height: 154 } },
      },
      groups: {},
    } as unknown as SceneView;
    const stamped = resolveScenePresentation(deepDoc, deepPres, {}, true, grouplessView).presentation.entities as Record<string, { depth?: number }>;
    expect(stamped["occurrence:e.l0"]?.depth).toBeUndefined();
    expect(stamped["occurrence:e.l1"]?.depth).toBe(1);
    expect(stamped["occurrence:e.l2"]?.depth).toBe(2);

    // Expanded & folded renderSceneSvg carry surface2 fallback and paint depth-1 folded card with surface2.
    const foldedL1 = renderSceneSvg({
      document: deepDoc,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: deepPres,
      measureLines,
      collapsed: [occurrenceRef("e.l1")],
    });
    expect(foldedL1.scene.nodes.map((n) => n.occurrence).sort()).toEqual(["occurrence:e.l0", "occurrence:e.l1"]);
    expect(foldedL1.svg).toContain("--st-component-diagramZone-surface2:#f8fafc");
    expect(foldedL1.svg).toContain("--st-semantic-surface-subtle:#f8fafc");
    expect(foldedL1.svg).toContain("var(--st-component-diagramZone-surface2, var(--st-semantic-surface-subtle))");

    // Flipped depthParityStart: 1 paints depth-0 outer zone with surface2 and depth-1 middle zone with surface1.
    const flippedSvg = renderSceneSvg({
      document: deepDoc,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: deepPres,
      measureLines,
      collapsed: [],
      depthParityStart: 1,
    });
    expect(flippedSvg.scene.nodes.find((n) => n.occurrence === "occurrence:e.l0")?.presentation?.depthParityStart).toBe(1);
    expect(flippedSvg.scene.nodes.find((n) => n.occurrence === "occurrence:e.l1")?.presentation?.depth).toBe(1);
    expect(flippedSvg.scene.nodes.find((n) => n.occurrence === "occurrence:e.l2")?.presentation?.depth).toBe(2);
    expect(flippedSvg.svg).toContain("var(--st-component-diagramZone-surface2, var(--st-semantic-surface-subtle))");
    expect(flippedSvg.svg).toContain("var(--st-component-diagramZone-surface1, var(--st-semantic-surface-raised))");
  });
});
