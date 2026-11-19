import { describe, expect, it } from "vitest";
import { createView, viewRef } from "@sentropic/diagram-core";
import {
  resolveScenePresentation,
  type SceneDocument,
  type ScenePresentation,
  type SceneView,
} from "../../src/presentation/diagramSceneModel.js";
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
  });

  it("should stamp nothing without a view", () => {
    const input = ownerInput("vue-globale");
    const viewless = resolveScenePresentation(input.document, input.presentation);
    for (const entry of Object.values(viewless.presentation.entities)) {
      expect("depth" in (entry as object)).toBe(false);
      expect("depthParityStart" in (entry as object)).toBe(false);
    }
  });
});
