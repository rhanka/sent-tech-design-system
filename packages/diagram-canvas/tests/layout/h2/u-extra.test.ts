import {
  canonicalise,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DS_LAYOUT_VOCABULARY,
  entityRef,
  lowerLayoutHints,
  occurrenceRef,
  type DsLayoutHintsV2,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  createLayoutCache,
  isR7ConnectorPresentation,
  layoutMeasured,
  type LayoutOptions,
  type LayoutResult,
} from "../../../src/index.js";
import { buildGenericScene, type H2Presentation, type H2ReferenceScene } from "./fixtures/referenceSet.js";

function baseOptionsOf(scene: H2ReferenceScene, extra?: Partial<LayoutOptions>): LayoutOptions {
  return {
    registry: scene.registry,
    bindings: scene.bindings,
    presentation: scene.presentation,
    measureLines: scene.measureLines,
    measureText: () => ({ width: 80, height: 20 }),
    targetWidth: 1440,
    hints: scene.hints,
    ...extra,
  };
}

function mustLayOut(res: LayoutResult, label: string): Extract<LayoutResult, { status: "laid-out" }> {
  expect(res.status, label).toBe("laid-out");
  if (res.status !== "laid-out") throw new Error(`refused ${label}: ${JSON.stringify(res.refusals)}`);
  return res;
}

function toV1Presentation(presentation: H2Presentation): H2Presentation {
  const entities = Object.fromEntries(
    Object.entries(presentation.entities).map(([id, entry]) => {
      const { anatomy: _a, ...rest } = entry;
      return [id, rest];
    }),
  );
  return {
    contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
    entities,
    legends: {},
    categoryTokens: [],
  };
}

describe("V-S4 (REQ-R7-34 / DE3-L6a2): conditional south uExtra on r7 only when a south U-channel actually runs", () => {
  it("drops phantom bottom uExtra inside r7 auto-packed container when top-shelf U-channel already fits above lower shelf", () => {
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
    const buildWithLabel = (id: string, label?: string) =>
      buildGenericScene({
        id,
        carries: ["V-S4", "REQ-R7-34"],
        hintsV2,
        entities: [
          { id: "host", container: true, title: "Service Group" },
          { id: "c1", parent: "host", title: "Card 1" },
          { id: "c2", parent: "host", title: "Card 2" },
          { id: "c3", parent: "host", title: "Card 3" },
          { id: "c4", parent: "host", title: "Card 4" },
        ],
        relations: [
          { id: "e1", source: "c1", target: "c2", ...(label === undefined ? {} : { label }) },
          { id: "e2", source: "c1", target: "c3" },
          { id: "e3", source: "c2", target: "c4" },
        ],
      });

    const unlabelled = buildWithLabel("vs4-unlabelled");
    // e1 label width > 96 base gap takes south U-channel in the 72px inter-shelf gap above c3/c4: no bottom uExtra needed!
    const topShelfWide = buildWithLabel("vs4-top-shelf-wide", "validates payloads");

    const resUnlabelled = mustLayOut(layoutMeasured(unlabelled.document, baseOptionsOf(unlabelled)), "unlabelled");
    const resWide = mustLayOut(layoutMeasured(topShelfWide.document, baseOptionsOf(topShelfWide)), "top-shelf-wide");

    expect(resWide.warnings.some((w) => w.code === "label-unplaced")).toBe(false);
    expect(resWide.routeSpacing?.conflictCount ?? 0).toBe(0);

    const hUnlabelled = resUnlabelled.view.entityOccurrences[occurrenceRef("e.host")]!.geometry.height;
    const hWide = resWide.view.entityOccurrences[occurrenceRef("e.host")]!.geometry.height;
    // Before V-S4, uExtra blindly added +30 px below the bottom shelf even though e1 ran between shelves.
    expect(hWide).toBe(hUnlabelled);
  });

  it("still reserves bounded south U-channel headroom on r7 when fixed zoneRule gutters prevent inline label placement", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1"],
          transverse_bands: [{ id: "r1", items: [entityRef("outer")] }],
          cells: { [entityRef("outer")]: { column: "s1" } },
        },
      },
    };
    const buildNested = (id: string, label?: string) =>
      buildGenericScene({
        id,
        carries: ["V-S4", "REQ-R7-34"],
        hintsV2,
        entities: [
          { id: "outer", container: true, title: "Outer Zone" },
          { id: "z1", parent: "outer", container: true, title: "Left Subzone" },
          { id: "z1a", parent: "z1", title: "Left Leaf" },
          { id: "z2", parent: "outer", container: true, title: "Right Subzone" },
          { id: "z2a", parent: "z2", title: "Right Leaf" },
        ],
        relations: [{ id: "e1", source: "z1", target: "z2", ...(label === undefined ? {} : { label }) }],
      });

    const unlabelled = buildNested("vs4-nested-unlabelled");
    // z1|z2 gutter is fixed at 96 under zoneRule -> label needs south U-channel inside outer!
    const labelled = buildNested("vs4-nested-labelled", "synchronizes state");

    const resUnlabelled = mustLayOut(layoutMeasured(unlabelled.document, baseOptionsOf(unlabelled)), "nested-unlabelled");
    const resLabelled = mustLayOut(layoutMeasured(labelled.document, baseOptionsOf(labelled)), "nested-labelled");

    expect(resLabelled.warnings.some((w) => w.code === "label-unplaced")).toBe(false);
    expect(resLabelled.routeSpacing?.conflictCount ?? 0).toBe(0);
    expect(Object.keys(resLabelled.labelBoxes ?? {}).length).toBe(1);

    const hUnlabelled = resUnlabelled.view.entityOccurrences[occurrenceRef("e.outer")]!.geometry.height;
    const hLabelled = resLabelled.view.entityOccurrences[occurrenceRef("e.outer")]!.geometry.height;
    expect(hLabelled).toBeGreaterThan(hUnlabelled);
    // Bounded to single U-channel headroom (+borderClearance 15 + labelBand 30 = +45 px max, never unbounded sum)
    expect(hLabelled - hUnlabelled).toBeLessThanOrEqual(45);
  });

  it("preserves southUExtra, label placement, and F-4 cache parity through createLayoutCache() with subtreeMemo enabled", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1"],
          transverse_bands: [{ id: "r1", items: [entityRef("outer")] }],
          cells: { [entityRef("outer")]: { column: "s1" } },
        },
      },
    };
    const labelled = buildGenericScene({
      id: "vs4-nested-cached",
      carries: ["V-S4", "F-4", "REQ-R7-34"],
      hintsV2,
      entities: [
        { id: "outer", container: true, title: "Outer Zone" },
        { id: "z1", parent: "outer", container: true, title: "Left Subzone" },
        { id: "z1a", parent: "z1", title: "Left Leaf" },
        { id: "z2", parent: "outer", container: true, title: "Right Subzone" },
        { id: "z2a", parent: "z2", title: "Right Leaf" },
      ],
      relations: [{ id: "e1", source: "z1", target: "z2", label: "synchronizes state" }],
    });

    const uncached = mustLayOut(layoutMeasured(labelled.document, baseOptionsOf(labelled)), "uncached");
    const cacheOn = createLayoutCache({ maxEntries: 32, subtreeMemo: true });
    const cacheOff = createLayoutCache({ maxEntries: 32, subtreeMemo: false });

    const cachedNominal = mustLayOut(cacheOn.layout(labelled.document, baseOptionsOf(labelled, { collapsed: [] })), "cached-nominal");
    const offNominal = mustLayOut(cacheOff.layout(labelled.document, baseOptionsOf(labelled, { collapsed: [] })), "off-nominal");

    expect(cachedNominal.warnings.some((w) => w.code === "label-unplaced")).toBe(false);
    expect(Object.keys(cachedNominal.labelBoxes ?? {})).toHaveLength(1);
    expect(cachedNominal.view.entityOccurrences[occurrenceRef("e.outer")]!.geometry.height).toBe(
      uncached.view.entityOccurrences[occurrenceRef("e.outer")]!.geometry.height,
    );
    expect(canonicalise(cachedNominal.view, "view")).toBe(canonicalise(uncached.view, "view"));
    expect(canonicalise(cachedNominal.view, "view")).toBe(canonicalise(offNominal.view, "view"));

    const cachedFolded = mustLayOut(
      cacheOn.layout(labelled.document, baseOptionsOf(labelled, { collapsed: [occurrenceRef("e.z1")] })),
      "cached-folded",
    );
    const offFolded = mustLayOut(
      cacheOff.layout(labelled.document, baseOptionsOf(labelled, { collapsed: [occurrenceRef("e.z1")] })),
      "off-folded",
    );
    expect(cachedFolded.warnings.some((w) => w.code === "label-unplaced")).toBe(false);
    expect(Object.keys(cachedFolded.labelBoxes ?? {})).toHaveLength(1);
    expect(canonicalise(cachedFolded.view, "view")).toBe(canonicalise(offFolded.view, "view"));
  });

  it("preserves v1 (!r7) conditional uExtra headroom verbatim (REQ-R7-28)", () => {
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
    const v1Base = buildGenericScene({
      id: "vs4-v1-unlabelled",
      carries: ["REQ-R7-28"],
      anatomy: "v1",
      hintsV2,
      entities: [
        { id: "host", container: true, title: "Group" },
        { id: "c1", parent: "host", title: "C1" },
        { id: "c2", parent: "host", title: "C2" },
      ],
      relations: [{ id: "e1", source: "c1", target: "c2" }],
    });
    const v1Label = buildGenericScene({
      id: "vs4-v1-labelled",
      carries: ["REQ-R7-28"],
      anatomy: "v1",
      hintsV2,
      entities: [
        { id: "host", container: true, title: "Group" },
        { id: "c1", parent: "host", title: "C1" },
        { id: "c2", parent: "host", title: "C2" },
      ],
      relations: [{ id: "e1", source: "c1", target: "c2", label: "validates payloads" }],
    });
    const presBase = toV1Presentation(v1Base.presentation);
    const presLabel = toV1Presentation(v1Label.presentation);
    expect(isR7ConnectorPresentation(presLabel, undefined, v1Label.document)).toBe(false);
    const v1Hints = lowerLayoutHints({ vocabulary: DS_LAYOUT_VOCABULARY, mode: "auto-pack", rootOrder: [entityRef("host")] });
    const rBase = mustLayOut(layoutMeasured(v1Base.document, { ...baseOptionsOf(v1Base), presentation: presBase, hints: v1Hints }), "v1-base");
    const rLabel = mustLayOut(layoutMeasured(v1Label.document, { ...baseOptionsOf(v1Label), presentation: presLabel, hints: v1Hints }), "v1-label");
    const hBase = rBase.view.entityOccurrences[occurrenceRef("e.host")]!.geometry.height;
    const hLabel = rLabel.view.entityOccurrences[occurrenceRef("e.host")]!.geometry.height;
    expect(hLabel - hBase).toBe(30);
  });
});
