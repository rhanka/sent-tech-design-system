import {
  entityRef,
  occurrenceRef,
  validateLayoutHintsV2,
  type DsLayoutHintsV2,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  createLayoutCache,
  diagnoseLabels,
  layoutDocument,
  layoutMeasured,
  layoutProcess,
  type LayoutResult,
  type Rect,
} from "../../../src/index.js";
import { layoutScene } from "../../../src/presentation/diagramSceneModel.js";
import { stackedZonesWidenedFixture } from "../../../test-support/stackedZonesWidenedFixture.js";
import { buildExampleB, buildGenericScene, h2Measurer } from "./fixtures/referenceSet.js";

const TOL = 1 / 64;

function assertCenteredHorizontally(outer: Rect, children: readonly Rect[], label: string): void {
  const minX = Math.min(...children.map((c) => c.x));
  const maxX = Math.max(...children.map((c) => c.x + c.width));
  const leftMargin = minX - outer.x;
  const rightMargin = outer.x + outer.width - maxX;
  expect(Math.abs(leftMargin - rightMargin), `${label}: left=${leftMargin} right=${rightMargin}`).toBeLessThanOrEqual(TOL);
}

describe("DE3-L7 widened stacked zones centring & refused-diagnostic invariant", () => {
  it("centres cards horizontally inside widened stacked zones and nested sub-zones", () => {
    const fixture = stackedZonesWidenedFixture();
    expect(validateLayoutHintsV2(fixture.hintsV2)).toEqual([]);

    const res = layoutScene({
      document: fixture.document,
      registry: fixture.registry,
      bindings: fixture.bindings,
      presentation: fixture.presentation,
      measureLines: h2Measurer(),
      collapsed: [],
      hints: fixture.hints,
      targetWidth: 1440,
    });
    expect(res.status).toBe("laid-out");
    if (res.status !== "laid-out") return;

    const geom = (id: string) => res.view.entityOccurrences[occurrenceRef(`e.${id}`)]!.geometry;
    const zOne = geom("zone-one");
    const zTwo = geom("zone-two");
    const zThree = geom("zone-three");
    const zNested = geom("zone-nested");
    const subNarrow = geom("sub-narrow");
    const subWide = geom("sub-wide");

    // Wider sibling widens col-main frames to match the widest stacked zone.
    expect(zOne.width).toBe(zNested.width);
    expect(zTwo.width).toBe(zNested.width);
    expect(zThree.width).toBe(zNested.width);
    expect(zOne.width).toBeGreaterThan(geom("c1").width + 32);
    expect(subNarrow.width).toBe(subWide.width);
    expect(subNarrow.width).toBeGreaterThan(geom("s1").width + 32);

    // Widened zones centre their inner cards horizontally (no unjustified right gap).
    assertCenteredHorizontally(zOne, [geom("c1")], "zone-one");
    assertCenteredHorizontally(zTwo, [geom("c2"), geom("c3")], "zone-two");
    assertCenteredHorizontally(zThree, [geom("c4"), geom("c5"), geom("c6")], "zone-three");
    assertCenteredHorizontally(subNarrow, [geom("s1")], "sub-narrow");
  });

  it("centres cards horizontally inside run.stretch-widened nested sub-zones in auto-pack", () => {
    const fixture = stackedZonesWidenedFixture({ nestedAutoPack: true });
    // Auto-pack with stretch: true exercises run.stretch on sibling sub-zones inside zone-nested.
    const res = layoutMeasured(fixture.document, {
      registry: fixture.registry,
      bindings: fixture.bindings,
      presentation: fixture.presentation,
      measureLines: h2Measurer(),
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: { stretch: true },
    });
    expect(res.status).toBe("laid-out");
    if (res.status !== "laid-out") return;
    const geom = (id: string) => res.view.entityOccurrences[occurrenceRef(`e.${id}`)]!.geometry;
    const subNarrow = geom("sub-narrow");
    const subWide = geom("sub-wide");
    expect(subNarrow.width).toBe(subWide.width);
    expect(subNarrow.width).toBeGreaterThan(geom("s1").width + 32);
    assertCenteredHorizontally(subNarrow, [geom("s1")], "auto-pack run.stretch sub-narrow");
  });

  it("tightens unwidened column-stack zone frames to their cards and keeps stage_columns: inherit intact", () => {
    const colStackHints: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          transverse_bands: [{ id: "main", items: [entityRef("col")] }],
        },
      },
      stacks: {
        [entityRef("col")]: { axis: "column" },
      },
    };
    const scene = buildGenericScene({
      id: "tight-col-stack",
      carries: ["REQ-R7-35"],
      hintsV2: colStackHints,
      entities: [
        { id: "col", container: true, title: "Column Wrapper" },
        { id: "narrow", container: true, parent: "col", title: "Narrow Zone" },
        { id: "n1", parent: "narrow", title: "N1" },
        { id: "wide", container: true, parent: "col", title: "Wide Zone" },
        { id: "w1", parent: "wide", title: "W1" },
        { id: "w2", parent: "wide", title: "W2" },
      ],
      relations: [],
    });
    const res = layoutScene({
      document: scene.document,
      registry: scene.registry,
      bindings: scene.bindings,
      presentation: scene.presentation,
      measureLines: scene.measureLines,
      collapsed: [],
      hints: scene.hints,
      targetWidth: 1440,
    });
    expect(res.status).toBe("laid-out");
    if (res.status !== "laid-out") return;
    const narrow = res.view.entityOccurrences[occurrenceRef("e.narrow")]!.geometry;
    const n1 = res.view.entityOccurrences[occurrenceRef("e.n1")]!.geometry;
    const wide = res.view.entityOccurrences[occurrenceRef("e.wide")]!.geometry;
    expect(narrow.width).toBeLessThan(wide.width);
    expect(narrow.width).toBe(n1.width + 32);

    // Inherited grids keep parent column centre alignment intact.
    const inheritScene = buildExampleB();
    const inheritRes = layoutMeasured(inheritScene.document, {
      registry: inheritScene.registry,
      bindings: inheritScene.bindings,
      presentation: inheritScene.presentation,
      measureLines: inheritScene.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: inheritScene.hints,
    });
    expect(inheritRes.status).toBe("laid-out");
    if (inheritRes.status !== "laid-out") return;
    const ay = inheritRes.view.entityOccurrences[occurrenceRef("e.ay")]!.geometry;
    const b5 = inheritRes.view.entityOccurrences[occurrenceRef("e.b5")]!.geometry;
    expect(Math.abs((ay.x + ay.width / 2) - (b5.x + b5.width / 2))).toBeLessThanOrEqual(TOL);
  });

  it("preserves F-4 subtreeMemo cache parity on widened stacked subtrees", () => {
    const fixture = stackedZonesWidenedFixture();
    const cacheOn = createLayoutCache({ maxEntries: 32, subtreeMemo: true });
    const cacheOff = createLayoutCache({ maxEntries: 32, subtreeMemo: false });
    const opts = {
      registry: fixture.registry,
      bindings: fixture.bindings,
      presentation: fixture.presentation,
      measureLines: h2Measurer(),
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: fixture.hints,
    };
    // Warm nominal + folded states.
    const onNominal = cacheOn.layout(fixture.document, { ...opts, collapsed: [] });
    const onFolded = cacheOn.layout(fixture.document, { ...opts, collapsed: [occurrenceRef("e.zone-one")] });
    const offFolded = cacheOff.layout(fixture.document, { ...opts, collapsed: [occurrenceRef("e.zone-one")] });
    expect(onNominal.status).toBe("laid-out");
    expect(onFolded.status).toBe("laid-out");
    expect(offFolded.status).toBe("laid-out");
    if (onFolded.status !== "laid-out" || offFolded.status !== "laid-out") return;
    expect(onFolded.view.entityOccurrences[occurrenceRef("e.s1")]!.geometry).toEqual(
      offFolded.view.entityOccurrences[occurrenceRef("e.s1")]!.geometry,
    );
    assertCenteredHorizontally(
      onFolded.view.entityOccurrences[occurrenceRef("e.sub-narrow")]!.geometry,
      [onFolded.view.entityOccurrences[occurrenceRef("e.s1")]!.geometry],
      "F-4 memoized sub-narrow",
    );
  });

  it("keeps zones widened solely by their own header floor unshifted (offsetX === 0)", () => {
    const headerOnlyHints: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          transverse_bands: [{ id: "main", items: [entityRef("hdr-zone")] }],
        },
      },
    };
    const scene = buildGenericScene({
      id: "header-floor-only",
      carries: ["REQ-R7-28"],
      hintsV2: headerOnlyHints,
      entities: [
        { id: "hdr-zone", container: true, title: "Very Long Zone Header That Exceeds Card Width By Far" },
        { id: "card-1", parent: "hdr-zone", title: "Card One" },
      ],
      relations: [],
    });
    const res = layoutScene({
      document: scene.document,
      registry: scene.registry,
      bindings: scene.bindings,
      presentation: scene.presentation,
      measureLines: scene.measureLines,
      collapsed: [],
      hints: scene.hints,
      targetWidth: 1440,
    });
    expect(res.status).toBe("laid-out");
    if (res.status !== "laid-out") return;
    const zone = res.view.entityOccurrences[occurrenceRef("e.hdr-zone")]!.geometry;
    const card = res.view.entityOccurrences[occurrenceRef("e.card-1")]!.geometry;
    expect(zone.width).toBeGreaterThan(card.width + 32);
    expect(card.x).toBe(zone.x + 16);
  });

  it("refuses align: stretch on column stacks containing cards at BOTH validation and layout with explicit diagnostics", () => {
    const bad = stackedZonesWidenedFixture({ stretchColumnStacks: true });
    const validationDiagnostics = validateLayoutHintsV2(bad.hintsV2);
    expect(validationDiagnostics.length).toBeGreaterThan(0);
    expect(validationDiagnostics[0]!.code).toBeTruthy();
    expect(validationDiagnostics[0]!.message.length).toBeGreaterThan(0);

    const laid = layoutScene({
      document: bad.document,
      registry: bad.registry,
      bindings: bad.bindings,
      presentation: bad.presentation,
      measureLines: h2Measurer(),
      collapsed: [],
      hints: bad.hints,
      targetWidth: 1440,
    });
    expect(laid.status).toBe("refused");
    if (laid.status === "refused") {
      expect(laid.refusals.length).toBeGreaterThan(0);
      expect(laid.diagnostics.length).toBeGreaterThan(0);
      expect(laid.diagnostics[0]!.code).toBeTruthy();
      expect(laid.diagnostics[0]!.message.length).toBeGreaterThan(0);
    }
  });

  it("guard: every refused status across layout entrypoints carries at least one diagnostic", () => {
    const fixture = stackedZonesWidenedFixture();
    const refusedResults: LayoutResult[] = [
      // 1. Invalid targetWidth on layoutMeasured / layoutScene
      layoutScene({
        document: fixture.document,
        registry: fixture.registry,
        bindings: fixture.bindings,
        presentation: fixture.presentation,
        measureLines: h2Measurer(),
        collapsed: [],
        targetWidth: 0,
      }),
      // 2. Missing measureLines on layoutMeasured
      layoutMeasured(fixture.document, {
        registry: fixture.registry,
        bindings: fixture.bindings,
        presentation: fixture.presentation,
        measureText: () => ({ width: 80, height: 20 }),
        targetWidth: 1440,
      }),
      // 3. Invalid rowPack on layoutMeasured
      layoutMeasured(fixture.document, {
        registry: fixture.registry,
        bindings: fixture.bindings,
        presentation: fixture.presentation,
        measureLines: h2Measurer(),
        measureText: () => ({ width: 80, height: 20 }),
        targetWidth: 1440,
        rowPack: { targetAspect: -1 },
      }),
      // 4. Invalid hint on layoutMeasured
      layoutMeasured(fixture.document, {
        registry: fixture.registry,
        bindings: fixture.bindings,
        presentation: fixture.presentation,
        measureLines: h2Measurer(),
        measureText: () => ({ width: 80, height: 20 }),
        targetWidth: 1440,
        hints: { cardGapY: 9999 },
      }),
      // 5. Invalid targetWidth on layoutDocument
      layoutDocument(fixture.document, {
        registry: fixture.registry,
        measureText: () => ({ width: 80, height: 20 }),
        targetWidth: -5,
      }),
      // 6. Invalid targetWidth on layoutMeasured with erd@1
      layoutMeasured(
        {
          ...fixture.document,
          profileRefs: ["erd@1"],
          entities: {},
          relations: {},
        },
        {
          registry: fixture.registry,
          presentation: fixture.presentation,
          measureLines: h2Measurer(),
          measureText: () => ({ width: 80, height: 20 }),
          targetWidth: 0,
        },
      ),
      // 7. Invalid targetWidth on layoutProcess
      layoutProcess(
        {
          ...fixture.document,
          profileRefs: ["process@1"],
          entities: {},
          relations: {},
        },
        {
          registry: fixture.registry,
          measureText: () => ({ width: 80, height: 20 }),
          targetWidth: 0,
        },
      ),
      // 8. Invalid targetWidth on diagnoseLabels
      diagnoseLabels(fixture.document, {
        registry: fixture.registry,
        measureText: () => ({ width: 80, height: 20 }),
        targetWidth: 0,
      }) as LayoutResult,
    ];

    for (const [index, res] of refusedResults.entries()) {
      expect(res.status, `case ${String(index)}`).toBe("refused");
      if (res.status === "refused") {
        expect(res.refusals.length, `case ${String(index)} refusals`).toBeGreaterThan(0);
        expect(res.diagnostics.length, `case ${String(index)} diagnostics`).toBeGreaterThan(0);
        for (const diag of res.diagnostics) {
          expect(diag.code.length).toBeGreaterThan(0);
          expect(diag.message.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
