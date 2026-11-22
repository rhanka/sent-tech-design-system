import { canonicalise, entityRef, lowerLayoutHintsV2, type DsLayoutHintsV2 } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  createLayoutCache,
  layoutFingerprint,
  linkStyleKey,
  type LevelOrientation,
  type LineMeasurer,
} from "../../../src/index.js";
import { resolveScene } from "../../../src/presentation/diagramSceneModel.js";
import { buildExampleA, buildGenericScene, h2Measurer } from "./fixtures/referenceSet.js";

function makeUnversionedMeasurer(overrides: Readonly<Record<string, number>>): LineMeasurer {
  const base = h2Measurer();
  return (request) => {
    const custom = overrides[request.text];
    if (custom !== undefined && request.role === "edge-label" && request.allocatedLines === 1) {
      const original = base(request);
      return { ...original, width: custom };
    }
    return base(request);
  };
}

describe("H2.2 result cache key and legend probe (S-1 / R1-2)", () => {
  it("never shares a cache entry when composition changes (one cell moved)", () => {
    const example = buildExampleA();
    const original = example.hintsV2 as Extract<DsLayoutHintsV2, { mode: "stage-columns" }>;
    const moved: DsLayoutHintsV2 = {
      ...original,
      grids: {
        ...original.grids,
        root: {
          ...original.grids.root,
          cells: {
            ...original.grids.root.cells,
            [entityRef("m2")]: { column: "s3" },
          },
        },
      },
    };
    const hints1 = lowerLayoutHintsV2(original);
    const hints2 = lowerLayoutHintsV2(moved);
    const baseOpts = {
      registry: example.registry,
      bindings: example.bindings,
      presentation: example.presentation,
      measureLines: example.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
    };

    expect(layoutFingerprint({ options: { ...baseOpts, hints: hints1 } })).not.toBe(
      layoutFingerprint({ options: { ...baseOpts, hints: hints2 } }),
    );

    const cache = createLayoutCache();
    cache.layout(example.document, { ...baseOpts, hints: hints1 });
    expect(cache.has(example.document, { ...baseOpts, hints: hints2 })).toBe(false);
    cache.layout(example.document, { ...baseOpts, hints: hints2 });
    expect(cache.stats().misses).toBe(2);
  });

  it("separates cache entries for two unversioned measurers equal on probe Mm09 É— but different on legend title", () => {
    const example = buildExampleA();
    const title = "Connector Guide";
    const m1 = makeUnversionedMeasurer({ [title]: 120 });
    const m2 = makeUnversionedMeasurer({ [title]: 420 });
    expect(m1.version).toBeUndefined();
    expect(m2.version).toBeUndefined();

    // Confirm both agree identically on the base probe.
    expect(m1({ text: "Mm09 É—", role: "edge-label", availableWidth: 290, allocatedLines: 1, folded: false })).toEqual(
      m2({ text: "Mm09 É—", role: "edge-label", availableWidth: 290, allocatedLines: 1, folded: false }),
    );

    const cache = createLayoutCache();
    const shared = {
      registry: example.registry,
      bindings: example.bindings,
      presentation: example.presentation,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: example.hints,
      legendTitle: title,
    };

    const r1 = cache.layout(example.document, { ...shared, measureLines: m1 });
    expect(cache.has(example.document, { ...shared, measureLines: m2 })).toBe(false);
    const r2 = cache.layout(example.document, { ...shared, measureLines: m2 });

    expect(r1.status).toBe("laid-out");
    expect(r2.status).toBe("laid-out");
    expect(cache.stats().misses).toBe(2);
    if (r1.status !== "laid-out" || r2.status !== "laid-out") return;
    expect(r1.linkLegend).toBeDefined();
    expect(r2.linkLegend).toBeDefined();
    expect(r2.linkLegend!.rect.width).toBeGreaterThan(r1.linkLegend!.rect.width);

    const scene2 = resolveScene(r2, {
      document: example.document,
      presentation: example.presentation,
      measureLines: m2,
      legendTitle: title,
    });
    expect(r2.linkLegend!.rect).toEqual(scene2.linkLegend!.rect);
  });

  it("separates cache entries for two unversioned measurers equal on probe and title but different on one legend label", () => {
    const example = buildExampleA();
    const dashedKey = linkStyleKey({ strokeStyle: "dashed", arrowhead: "arrow", emphasis: "default" });
    const customLabel = "Proposed Policy Flow";
    const m1 = makeUnversionedMeasurer({ [customLabel]: 110 });
    const m2 = makeUnversionedMeasurer({ [customLabel]: 480 });

    const cache = createLayoutCache();
    const shared = {
      registry: example.registry,
      bindings: example.bindings,
      presentation: example.presentation,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: example.hints,
      legendLabels: { [dashedKey]: customLabel },
    };

    const r1 = cache.layout(example.document, { ...shared, measureLines: m1 });
    expect(cache.has(example.document, { ...shared, measureLines: m2 })).toBe(false);
    const r2 = cache.layout(example.document, { ...shared, measureLines: m2 });

    expect(cache.stats().misses).toBe(2);
    expect(r1.status).toBe("laid-out");
    expect(r2.status).toBe("laid-out");
    if (r1.status !== "laid-out" || r2.status !== "laid-out") return;
    expect(r2.linkLegend!.rect.width).toBeGreaterThan(r1.linkLegend!.rect.width);

    const scene2 = resolveScene(r2, {
      document: example.document,
      presentation: example.presentation,
      measureLines: m2,
      legendLabels: { [dashedKey]: customLabel },
    });
    expect(r2.linkLegend!.rect).toEqual(scene2.linkLegend!.rect);
  });

  it("keeps non-composed cache keys untouched when legend options differ", () => {
    const example = buildExampleA();
    const cache = createLayoutCache();
    const shared = {
      registry: example.registry,
      bindings: example.bindings,
      presentation: example.presentation,
      measureLines: example.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
    };
    cache.layout(example.document, { ...shared, legendTitle: "Title A" });
    expect(cache.has(example.document, { ...shared, legendTitle: "Title B" })).toBe(true);
  });

  it("includes previousOrientation in composed result cache keys (F-4): flipped previousOrientation misses result cache, hits plan cache, and yields byte-identical view", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1"],
          transverse_bands: [{ id: "r1", items: [entityRef("host")] }],
          cells: { [entityRef("host")]: { column: "s1" } },
        },
      },
    };
    const scene = buildGenericScene({
      id: "composed-prev-orient-key",
      carries: ["F-2", "F-4"],
      hintsV2,
      entities: [
        { id: "host", container: true, title: "Auto-Packed Host" },
        { id: "c1", parent: "host", title: "Card 1" },
        { id: "c2", parent: "host", title: "Card 2" },
        { id: "c3", parent: "host", title: "Card 3" },
        { id: "c4", parent: "host", title: "Card 4" },
      ],
      relations: [],
    });
    const baseOpts = {
      registry: scene.registry,
      bindings: scene.bindings,
      presentation: scene.presentation,
      measureLines: scene.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: scene.hints,
    };

    const cache = createLayoutCache();
    const r1 = cache.layout(scene.document, baseOpts);
    expect(r1.status).toBe("laid-out");
    if (r1.status !== "laid-out") return;
    expect(r1.orientations).toBeDefined();
    const emitted = r1.orientations!;
    expect(Object.keys(emitted).length).toBeGreaterThan(0);

    // Fixed-point previousOrientation still hits the result cache.
    expect(cache.has(scene.document, { ...baseOpts, previousOrientation: emitted })).toBe(true);
    const same = cache.layout(scene.document, { ...baseOpts, previousOrientation: emitted });
    expect(same).toBe(r1);
    expect(cache.stats()).toMatchObject({ hits: 1, misses: 1 });

    // Flipped previousOrientation MUST miss the composed result cache (never short-circuit F-4),
    // reuse the nominal plan cache, and return byte-identical canonical view bytes (F-2).
    const flipped: Record<string, LevelOrientation> = {};
    for (const [k, v] of Object.entries(r1.orientations ?? {})) {
      flipped[k] = v === "rows" ? "columns" : "rows";
    }
    expect(cache.has(scene.document, { ...baseOpts, previousOrientation: flipped })).toBe(false);
    const r2 = cache.layout(scene.document, { ...baseOpts, previousOrientation: flipped });
    expect(r2.status).toBe("laid-out");
    expect(cache.stats()).toMatchObject({ hits: 1, misses: 2 });
    expect(cache.planStats()).toMatchObject({ planEntries: 1, planMisses: 1, planHits: 1 });
    if (r2.status === "laid-out") {
      expect(canonicalise(r2.view, "view")).toBe(canonicalise(r1.view, "view"));
      expect(r2.orientations).toEqual(r1.orientations);
    }
  });
});
