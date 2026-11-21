import { entityRef, lowerLayoutHintsV2, type DsLayoutHintsV2 } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  createLayoutCache,
  layoutFingerprint,
  linkStyleKey,
  type LineMeasurer,
} from "../../../src/index.js";
import { resolveScene } from "../../../src/presentation/diagramSceneModel.js";
import { buildExampleA, h2Measurer } from "./fixtures/referenceSet.js";

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
});
