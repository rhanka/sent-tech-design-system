import {
  canonicalise,
  entityRef,
  lowerLayoutHintsV2,
  occurrenceRef,
  projectView,
  type DsLayoutHintsV2,
  type EntityRef,
  type OccurrenceRef,
  type ViewDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  computeCompositionPlanKey,
  createLayoutCache,
  layoutMeasured,
  type LayoutOptions,
  type LayoutResult,
  type LevelOrientation,
  type LineMeasurer,
  type Rect,
} from "../../../src/index.js";
import { computeNominalCompositionPlan } from "../../../src/layout/measured.js";
import { createSubtreeMemo } from "../../../src/layout/plan.js";
import {
  buildAppctxArchitecture16x9,
  buildExampleA,
  buildExampleB,
  buildFigkitTwins,
  buildGenericScene,
  enumerateVisibleFoldStates,
  type H2ReferenceScene,
} from "./fixtures/referenceSet.js";

const TOL = 1 / 64;
const centerX = (r: Rect): number => r.x + r.width / 2;

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

/** Relative internal layout of a container: direct placed children rects relative to container origin. */
function relativeChildrenSignature(
  res: Extract<LayoutResult, { status: "laid-out" }>,
  parent: EntityRef,
  document: H2ReferenceScene["document"],
): string | undefined {
  const occByEntity = new Map<EntityRef, { id: OccurrenceRef; geometry: Rect }>();
  for (const occ of Object.values(res.view.entityOccurrences)) {
    occByEntity.set(occ.entity, { id: occ.id, geometry: occ.geometry });
  }
  const parentOcc = occByEntity.get(parent);
  if (parentOcc === undefined) return undefined;
  const children: { entity: string; dx: number; dy: number; w: number; h: number }[] = [];
  for (const rel of Object.values(document.relations)) {
    if (rel.type !== "contains") continue;
    const p = rel.endpoints.find((e) => e.role === "parent")?.target as EntityRef | undefined;
    const c = rel.endpoints.find((e) => e.role === "child")?.target as EntityRef | undefined;
    if (p !== parent || c === undefined) continue;
    const childOcc = occByEntity.get(c);
    if (childOcc === undefined) continue;
    // Hidden children keep default zero geometry outside the visible drawn view; check visibility via fold groups
    children.push({
      entity: c,
      dx: Math.round((childOcc.geometry.x - parentOcc.geometry.x) * 1024) / 1024,
      dy: Math.round((childOcc.geometry.y - parentOcc.geometry.y) * 1024) / 1024,
      w: Math.round(childOcc.geometry.width * 1024) / 1024,
      h: Math.round(childOcc.geometry.height * 1024) / 1024,
    });
  }
  children.sort((a, b) => (a.entity < b.entity ? -1 : a.entity > b.entity ? 1 : 0));
  return JSON.stringify(children);
}

/** Collect all containers that inherit columns (directly or transitively) inside a composition. */
function inheritingContainersOf(scene: H2ReferenceScene): Set<EntityRef> {
  const out = new Set<EntityRef>();
  const grids = scene.hints.composition?.grids;
  if (grids === undefined) return out;
  for (const [scope, grid] of Object.entries(grids)) {
    if (scope !== "root" && grid?.stage_columns === "inherit") out.add(scope as EntityRef);
  }
  return out;
}

/** Semantic ancestor set of an entity in a document. */
function ancestorsOf(document: H2ReferenceScene["document"], entity: EntityRef): Set<EntityRef> {
  const parentMap = new Map<EntityRef, EntityRef>();
  for (const rel of Object.values(document.relations)) {
    if (rel.type !== "contains") continue;
    const p = rel.endpoints.find((e) => e.role === "parent")?.target as EntityRef | undefined;
    const c = rel.endpoints.find((e) => e.role === "child")?.target as EntityRef | undefined;
    if (p !== undefined && c !== undefined) parentMap.set(c, p);
  }
  const set = new Set<EntityRef>();
  let cur = parentMap.get(entity);
  while (cur !== undefined && !set.has(cur)) {
    set.add(cur);
    cur = parentMap.get(cur);
  }
  return set;
}

/** Semantic descendants of an entity in a document. */
function descendantsOf(document: H2ReferenceScene["document"], entity: EntityRef): Set<EntityRef> {
  const childrenMap = new Map<EntityRef, EntityRef[]>();
  for (const rel of Object.values(document.relations)) {
    if (rel.type !== "contains") continue;
    const p = rel.endpoints.find((e) => e.role === "parent")?.target as EntityRef | undefined;
    const c = rel.endpoints.find((e) => e.role === "child")?.target as EntityRef | undefined;
    if (p !== undefined && c !== undefined) {
      const list = childrenMap.get(p) ?? [];
      list.push(c);
      childrenMap.set(p, list);
    }
  }
  const out = new Set<EntityRef>();
  const visit = (id: EntityRef) => {
    for (const c of childrenMap.get(id) ?? []) {
      if (out.has(c)) continue;
      out.add(c);
      visit(c);
    }
  };
  visit(entity);
  return out;
}

/**
 * Independent F-6 painted-gap verifier: measures every visible sibling container pair
 * directly from `res.view.entityOccurrences` (never trusting `paintedGapsAboveToken`
 * to validate itself), independently computes gutter and §4.3 slot slack from painted
 * boxes and track lines, and asserts exact soundness + completeness against the report.
 */
function verifyF6PaintedGapsFromGeometry(
  scene: H2ReferenceScene,
  collapsed: readonly OccurrenceRef[],
  res: Extract<LayoutResult, { status: "laid-out" }>,
  label: string,
  zoneGutter = 96,
): void {
  // 1. Every emitted zone channel must keep the token width.
  for (const ch of res.channels ?? []) {
    if (ch.zone === true) {
      expect(ch.gap, `${label}:zone-gutter:${ch.id}`).toBe(zoneGutter);
    }
  }

  // 2. Build semantic parent map and visible entity set directly from document + collapsed.
  const parentOf = new Map<EntityRef, EntityRef>();
  for (const rel of Object.values(scene.document.relations)) {
    if (rel.type !== "contains") continue;
    const p = rel.endpoints.find((e) => e.role === "parent")?.target as EntityRef | undefined;
    const c = rel.endpoints.find((e) => e.role === "child")?.target as EntityRef | undefined;
    if (p !== undefined && c !== undefined) parentOf.set(c, p);
  }
  const collapsedSet = new Set<OccurrenceRef>(collapsed);
  for (const group of Object.values(res.view.groups)) {
    if (group.collapsed === true && group.occurrence !== undefined) collapsedSet.add(group.occurrence);
  }
  const collapsedEntities = new Set<EntityRef>();
  for (const occ of Object.values(res.view.entityOccurrences)) {
    if (collapsedSet.has(occ.id)) collapsedEntities.add(occ.entity);
  }
  const isVisible = (entity: EntityRef): boolean => {
    let cur = parentOf.get(entity);
    while (cur !== undefined) {
      if (collapsedEntities.has(cur)) return false;
      cur = parentOf.get(cur);
    }
    return true;
  };

  // 3. Read actual painted rects directly from res.view.entityOccurrences.
  const paintedRectByEntity = new Map<EntityRef, Rect>();
  for (const occ of Object.values(res.view.entityOccurrences)) {
    if (!isVisible(occ.entity)) continue;
    if (occ.geometry.width > 0 && occ.geometry.height > 0) {
      paintedRectByEntity.set(occ.entity, occ.geometry);
    }
  }

  const containerSet = new Set<EntityRef>(scene.containers);
  const grids = res.composition?.grids ?? {};
  const expectedAboveToken = new Map<
    string,
    { readonly paintedGap: number; readonly fromSlack?: number; readonly toSlack?: number }
  >();

  // 4. Composed grid scopes: verify cell rects match painted occurrences, track zone gutters === token,
  //    independently measure painted gaps & §4.3 slot slack for every adjacent sibling container pair.
  for (const [scope, gridReport] of Object.entries(grids)) {
    const gridSpec =
      scope === "root"
        ? scene.hints.composition?.grids.root
        : scene.hints.composition?.grids[scope as EntityRef];
    const isInherit = gridSpec?.stage_columns === "inherit";
    const peripheralEntities = new Set<EntityRef>(
      (gridSpec?.peripheral_columns ?? []).flatMap((col) => col.items),
    );

    for (const cell of gridReport.cells) {
      const painted = paintedRectByEntity.get(cell.entity);
      expect(painted, `${label}:painted-exists:${scope}:${cell.entity}`).toBeDefined();
      if (painted !== undefined) {
        expect(Math.abs(painted.x - cell.boxRect.x), `${label}:cell-x:${cell.entity}`).toBeLessThanOrEqual(TOL);
        expect(Math.abs(painted.y - cell.boxRect.y), `${label}:cell-y:${cell.entity}`).toBeLessThanOrEqual(TOL);
        expect(Math.abs(painted.width - cell.boxRect.width), `${label}:cell-w:${cell.entity}`).toBeLessThanOrEqual(TOL);
        expect(Math.abs(painted.height - cell.boxRect.height), `${label}:cell-h:${cell.entity}`).toBeLessThanOrEqual(TOL);
      }
    }

    const colHasContainer = gridReport.columns.map((_, idx) =>
      gridReport.cells.some((c) => containerSet.has(c.entity) && c.colStart >= 0 && idx >= c.colStart && idx <= c.colEnd),
    );
    for (let i = 0; i + 1 < gridReport.columns.length; i += 1) {
      if (colHasContainer[i] || colHasContainer[i + 1]) {
        const g = gridReport.columns[i + 1]!.start - (gridReport.columns[i]!.start + gridReport.columns[i]!.size);
        expect(Math.abs(g - zoneGutter), `${label}:col-track-gutter:${scope}:${i}`).toBeLessThanOrEqual(TOL);
      }
    }
    // Per H2-STEP0 §4.3 step 5, a peripheral item counts in its own column only, never in bands.
    const bandHasContainer = gridReport.bands.map((_, idx) =>
      gridReport.cells.some(
        (c) =>
          containerSet.has(c.entity) &&
          !peripheralEntities.has(c.entity) &&
          c.bandStart >= 0 &&
          idx >= c.bandStart &&
          idx <= c.bandEnd,
      ),
    );
    for (let j = 0; j + 1 < gridReport.bands.length; j += 1) {
      if (bandHasContainer[j] || bandHasContainer[j + 1]) {
        const g = gridReport.bands[j + 1]!.start - (gridReport.bands[j]!.start + gridReport.bands[j]!.size);
        expect(Math.abs(g - zoneGutter), `${label}:band-track-gutter:${scope}:${j}`).toBeLessThanOrEqual(TOL);
      }
    }

    const containerCells = gridReport.cells.filter((c) => containerSet.has(c.entity));
    for (let i = 0; i < containerCells.length; i += 1) {
      const a = containerCells[i]!;
      const rectA = paintedRectByEntity.get(a.entity)!;
      for (let j = 0; j < containerCells.length; j += 1) {
        if (i === j) continue;
        const b = containerCells[j]!;
        const rectB = paintedRectByEntity.get(b.entity)!;

        // Horizontal adjacency across a column boundary
        if (
          a.colEnd >= 0 &&
          b.colStart >= 0 &&
          a.colEnd + 1 === b.colStart &&
          a.bandStart >= 0 &&
          b.bandStart >= 0 &&
          Math.max(a.bandStart, b.bandStart) <= Math.min(a.bandEnd, b.bandEnd)
        ) {
          const colA = gridReport.columns[a.colEnd]!;
          const colB = gridReport.columns[b.colStart]!;
          const trackGutter = colB.start - (colA.start + colA.size);
          const paintedGap = rectB.x - (rectA.x + rectA.width);
          const fromSlack = colA.start + colA.size - (rectA.x + rectA.width);
          const toSlack = rectB.x - colB.start;
          expect(Math.abs(trackGutter - zoneGutter), `${label}:h-gutter:${a.entity}->${b.entity}`).toBeLessThanOrEqual(TOL);
          expect(fromSlack, `${label}:h-fromSlack>=0:${a.entity}`).toBeGreaterThanOrEqual(-TOL);
          expect(toSlack, `${label}:h-toSlack>=0:${b.entity}`).toBeGreaterThanOrEqual(-TOL);
          expect(Math.abs(paintedGap - (zoneGutter + fromSlack + toSlack)), `${label}:h-gap-sum`).toBeLessThanOrEqual(TOL);

          // Independently verify §4.3 slot alignment slack on non-inheriting single-column stage cells
          if (!isInherit && a.colStart === a.colEnd && colA.kind === "stage") {
            const justifyA = gridSpec?.cells?.[a.entity]?.justify;
            if (!collapsedEntities.has(a.entity) && (justifyA === undefined || justifyA === "stretch")) {
              expect(fromSlack, `${label}:h-stretch-a:${a.entity}`).toBeLessThanOrEqual(TOL);
            } else if (collapsedEntities.has(a.entity) && (justifyA === undefined || justifyA === "center")) {
              expect(Math.abs(fromSlack - (colA.size - rectA.width) / 2), `${label}:h-center-a:${a.entity}`).toBeLessThanOrEqual(TOL);
            }
          }
          if (!isInherit && b.colStart === b.colEnd && colB.kind === "stage") {
            const justifyB = gridSpec?.cells?.[b.entity]?.justify;
            if (!collapsedEntities.has(b.entity) && (justifyB === undefined || justifyB === "stretch")) {
              expect(toSlack, `${label}:h-stretch-b:${b.entity}`).toBeLessThanOrEqual(TOL);
            } else if (collapsedEntities.has(b.entity) && (justifyB === undefined || justifyB === "center")) {
              expect(Math.abs(toSlack - (colB.size - rectB.width) / 2), `${label}:h-center-b:${b.entity}`).toBeLessThanOrEqual(TOL);
            }
          }

          if (paintedGap > zoneGutter + 1e-6) {
            expectedAboveToken.set(`${scope}|horizontal|${a.entity}|${b.entity}`, { paintedGap, fromSlack, toSlack });
          }
        }

        // Vertical adjacency across a band boundary
        if (a.bandEnd >= 0 && b.bandStart >= 0 && a.bandEnd + 1 === b.bandStart) {
          const sameColRange =
            a.colStart >= 0 && b.colStart >= 0
              ? Math.max(a.colStart, b.colStart) <= Math.min(a.colEnd, b.colEnd)
              : Math.min(rectA.x + rectA.width, rectB.x + rectB.width) > Math.max(rectA.x, rectB.x);
          if (sameColRange) {
            const bandA = gridReport.bands[a.bandEnd]!;
            const bandB = gridReport.bands[b.bandStart]!;
            const trackGutter = bandB.start - (bandA.start + bandA.size);
            const paintedGap = rectB.y - (rectA.y + rectA.height);
            const fromSlack = bandA.start + bandA.size - (rectA.y + rectA.height);
            const toSlack = rectB.y - bandB.start;
            expect(Math.abs(trackGutter - zoneGutter), `${label}:v-gutter:${a.entity}->${b.entity}`).toBeLessThanOrEqual(TOL);
            expect(fromSlack, `${label}:v-fromSlack>=0:${a.entity}`).toBeGreaterThanOrEqual(-TOL);
            expect(toSlack, `${label}:v-toSlack>=0:${b.entity}`).toBeGreaterThanOrEqual(-TOL);
            expect(Math.abs(paintedGap - (zoneGutter + fromSlack + toSlack)), `${label}:v-gap-sum`).toBeLessThanOrEqual(TOL);

            if (a.bandStart === a.bandEnd && bandA.kind === "band" && !peripheralEntities.has(a.entity)) {
              const alignA = gridSpec?.cells?.[a.entity]?.align;
              if (!collapsedEntities.has(a.entity) && (alignA === undefined || alignA === "stretch")) {
                expect(fromSlack, `${label}:v-stretch-a:${a.entity}`).toBeLessThanOrEqual(TOL);
              } else if (collapsedEntities.has(a.entity) && (alignA === undefined || alignA === "center")) {
                expect(Math.abs(fromSlack - (bandA.size - rectA.height) / 2), `${label}:v-center-a:${a.entity}`).toBeLessThanOrEqual(TOL);
              }
            }
            if (b.bandStart === b.bandEnd && bandB.kind === "band" && !peripheralEntities.has(b.entity)) {
              const alignB = gridSpec?.cells?.[b.entity]?.align;
              if (!collapsedEntities.has(b.entity) && (alignB === undefined || alignB === "stretch")) {
                expect(toSlack, `${label}:v-stretch-b:${b.entity}`).toBeLessThanOrEqual(TOL);
              } else if (collapsedEntities.has(b.entity) && (alignB === undefined || alignB === "center")) {
                expect(Math.abs(toSlack - (bandB.size - rectB.height) / 2), `${label}:v-center-b:${b.entity}`).toBeLessThanOrEqual(TOL);
              }
            }

            if (paintedGap > zoneGutter + 1e-6) {
              expectedAboveToken.set(`${scope}|vertical|${a.entity}|${b.entity}`, { paintedGap, fromSlack, toSlack });
            }
          }
        }
      }
    }
  }

  // 5. Non-grid scopes (auto-packed / stacked sibling containers): measure directly from painted rects.
  const siblingsByScope = new Map<string, EntityRef[]>();
  for (const entity of paintedRectByEntity.keys()) {
    const scope = parentOf.get(entity) ?? "root";
    const list = siblingsByScope.get(scope) ?? [];
    list.push(entity);
    siblingsByScope.set(scope, list);
  }
  for (const [scope, siblings] of siblingsByScope) {
    if (grids[scope] !== undefined) continue;
    const childContainers = siblings.filter((e) => containerSet.has(e));
    if (childContainers.length < 2) continue;
    for (const a of childContainers) {
      const rectA = paintedRectByEntity.get(a)!;
      for (const b of childContainers) {
        if (a === b) continue;
        const rectB = paintedRectByEntity.get(b)!;
        // Horizontal neighbour with vertical overlap and no sibling between them
        if (
          rectB.x >= rectA.x + rectA.width - TOL &&
          Math.min(rectA.y + rectA.height, rectB.y + rectB.height) > Math.max(rectA.y, rectB.y) + TOL
        ) {
          const blocked = siblings.some((mid) => {
            if (mid === a || mid === b) return false;
            const rm = paintedRectByEntity.get(mid)!;
            const yOverlap = Math.min(rectA.y + rectA.height, rectB.y + rectB.height, rm.y + rm.height) >
              Math.max(rectA.y, rectB.y, rm.y) + TOL;
            return yOverlap && rm.x >= rectA.x + rectA.width - TOL && rm.x + rm.width <= rectB.x + TOL;
          });
          if (!blocked) {
            const paintedGap = rectB.x - (rectA.x + rectA.width);
            expect(paintedGap, `${label}:nongrid-h:${a}->${b}`).toBeGreaterThanOrEqual(zoneGutter - TOL);
            if (paintedGap > zoneGutter + 1e-6) {
              expectedAboveToken.set(`${scope}|horizontal|${a}|${b}`, { paintedGap });
            }
          }
        }
        // Vertical neighbour with horizontal overlap and no sibling between them
        if (
          rectB.y >= rectA.y + rectA.height - TOL &&
          Math.min(rectA.x + rectA.width, rectB.x + rectB.width) > Math.max(rectA.x, rectB.x) + TOL
        ) {
          const blocked = siblings.some((mid) => {
            if (mid === a || mid === b) return false;
            const rm = paintedRectByEntity.get(mid)!;
            const xOverlap = Math.min(rectA.x + rectA.width, rectB.x + rectB.width, rm.x + rm.width) >
              Math.max(rectA.x, rectB.x, rm.x) + TOL;
            return xOverlap && rm.y >= rectA.y + rectA.height - TOL && rm.y + rm.height <= rectB.y + TOL;
          });
          if (!blocked) {
            const paintedGap = rectB.y - (rectA.y + rectA.height);
            expect(paintedGap, `${label}:nongrid-v:${a}->${b}`).toBeGreaterThanOrEqual(zoneGutter - TOL);
            if (paintedGap > zoneGutter + 1e-6) {
              expectedAboveToken.set(`${scope}|vertical|${a}|${b}`, { paintedGap });
            }
          }
        }
      }
    }
  }

  // 6. Soundness & completeness: reported `paintedGapsAboveToken` MUST match the exact set
  //    independently discovered from painted occurrences, with matching geometry.
  const reported = res.composition?.paintedGapsAboveToken ?? [];
  const reportedKeys = reported.map((g) => `${g.scope}|${g.axis}|${g.left}|${g.right}`).sort();
  const expectedKeys = [...expectedAboveToken.keys()].sort();
  expect(reportedKeys, `${label}:paintedGapsAboveToken-keys`).toEqual(expectedKeys);
  for (const gap of reported) {
    const key = `${gap.scope}|${gap.axis}|${gap.left}|${gap.right}`;
    const exp = expectedAboveToken.get(key)!;
    expect(gap.token, `${label}:painted-token:${key}`).toBe(zoneGutter);
    expect(Math.abs(gap.paintedGap - exp.paintedGap), `${label}:painted-gap:${key}`).toBeLessThanOrEqual(TOL);
    if (exp.fromSlack !== undefined && exp.toSlack !== undefined) {
      expect(Math.abs(gap.fromSlack - exp.fromSlack), `${label}:painted-fromSlack:${key}`).toBeLessThanOrEqual(TOL);
      expect(Math.abs(gap.toSlack - exp.toSlack), `${label}:painted-toSlack:${key}`).toBeLessThanOrEqual(TOL);
    }
  }
}

describe("H2.5 fold-aware nominal plan, plan cache, subtree memo (D-6), invariants F-1…F-6", () => {
  function verifyCorpusScenes(corpus: readonly H2ReferenceScene[]): {
    totalStates: number;
    totalUntouchedEdges: number;
    routeLocalityChanged: number;
  } {
    let totalStates = 0;
    let totalUntouchedEdges = 0;
    let routeLocalityChanged = 0;

    for (const scene of corpus) {
      const states = enumerateVisibleFoldStates(scene.document, scene.containers, scene.sourceView);
      expect(states.length, scene.id).toBeGreaterThanOrEqual(2);
      totalStates += states.length;

      const cacheOn = createLayoutCache({ maxEntries: 128, subtreeMemo: true });
      const cacheOff = createLayoutCache({ maxEntries: 128, subtreeMemo: false });
      const resultsByKey = new Map<string, Extract<LayoutResult, { status: "laid-out" }>>();

      const nominal = mustLayOut(
        cacheOn.layout(scene.document, baseOptionsOf(scene, { collapsed: [] }), scene.sourceView),
        `${scene.id}:nominal`,
      );
      const nominalDigest = nominal.composition?.planDigest;
      expect(nominalDigest, scene.id).toBeDefined();
      const nominalOrientations = nominal.orientations ?? {};
      const nominalGrids = nominal.composition!.grids;
      const inheritors = inheritingContainersOf(scene);
      const flippedNominalPrev: Record<string, LevelOrientation> = {};
      for (const [levelKey, orient] of Object.entries(nominalOrientations)) {
        flippedNominalPrev[levelKey] = orient === "rows" ? "columns" : "rows";
      }
      const builtPlan = computeNominalCompositionPlan(scene.document, baseOptionsOf(scene), scene.sourceView);
      expect(builtPlan.status, `${scene.id}:plan`).toBe("ok");
      const nominalPlan = builtPlan.status === "ok" ? builtPlan.plan : undefined;

      // F-2 (S-1): nominal plan computation ignores opposite previousOrientation (direct uncached call).
      const nominalWithFlippedPrev = mustLayOut(
        layoutMeasured(
          scene.document,
          baseOptionsOf(scene, { collapsed: [], previousOrientation: flippedNominalPrev }),
          scene.sourceView,
        ),
        `${scene.id}:nominal:prev`,
      );
      expect(canonicalise(nominalWithFlippedPrev.view, "view")).toBe(canonicalise(nominal.view, "view"));

      for (const collapsed of states) {
        const key = collapsed.join(",");
        const resOn = mustLayOut(
          cacheOn.layout(scene.document, baseOptionsOf(scene, { collapsed }), scene.sourceView),
          `${scene.id}:on:${key}`,
        );
        const resOff = mustLayOut(
          cacheOff.layout(scene.document, baseOptionsOf(scene, { collapsed }), scene.sourceView),
          `${scene.id}:off:${key}`,
        );
        resultsByKey.set(key, resOn);

        // Memo on vs off byte-identical (D-6)
        expect(canonicalise(resOn.view, "view"), `${scene.id}:${key}:memo-view`).toBe(canonicalise(resOff.view, "view"));
        expect(canonicalise(resOn.composition), `${scene.id}:${key}:memo-comp`).toBe(canonicalise(resOff.composition));
        expect(resOn.orientations, `${scene.id}:${key}:memo-orient`).toEqual(resOff.orientations);

        // Same nominal plan digest across every fold state
        expect(resOn.composition?.planDigest, `${scene.id}:${key}:planDigest`).toBe(nominalDigest);

        // F-1 Membership: every visible entity placed in a grid stays in the same grid, band, and column range
        for (const [scope, gridReport] of Object.entries(resOn.composition!.grids)) {
          const nomGrid = nominalGrids[scope];
          expect(nomGrid, `${scene.id}:${key}:grid:${scope}`).toBeDefined();
          if (nomGrid === undefined) continue;
          const nomCellByEntity = new Map(nomGrid.cells.map((c) => [c.entity, c]));
          for (const cell of gridReport.cells) {
            const nomCell = nomCellByEntity.get(cell.entity);
            expect(nomCell, `${scene.id}:${key}:cell:${scope}:${cell.entity}`).toBeDefined();
            if (nomCell === undefined) continue;
            // Same column ids and band ids when staged
            if (cell.colStart >= 0 && nomCell.colStart >= 0) {
              expect(gridReport.columns[cell.colStart]!.id).toBe(nomGrid.columns[nomCell.colStart]!.id);
              expect(gridReport.columns[cell.colEnd]!.id).toBe(nomGrid.columns[nomCell.colEnd]!.id);
            }
            if (cell.bandStart >= 0 && nomCell.bandStart >= 0) {
              expect(gridReport.bands[cell.bandStart]!.id).toBe(nomGrid.bands[nomCell.bandStart]!.id);
              expect(gridReport.bands[cell.bandEnd]!.id).toBe(nomGrid.bands[nomCell.bandEnd]!.id);
            }
          }
        }

        // F-2 Partition: every visible auto-packed level keeps the nominal plan's orientation
        for (const [levelKey, orient] of Object.entries(resOn.orientations ?? {})) {
          if (nominalOrientations[levelKey] !== undefined) {
            expect(orient, `${scene.id}:${key}:orient:${levelKey}`).toBe(nominalOrientations[levelKey]);
          }
        }

        // F-2 (S-2): passing opposite previousOrientation directly (uncached, reusing only the nominal plan)
        // produces byte-identical output.
        const withFlippedPrev = mustLayOut(
          layoutMeasured(
            scene.document,
            baseOptionsOf(scene, { collapsed, previousOrientation: flippedNominalPrev }),
            scene.sourceView,
            nominalPlan === undefined ? undefined : { plan: nominalPlan },
          ),
          `${scene.id}:prev:${key}`,
        );
        expect(canonicalise(withFlippedPrev.view, "view")).toBe(canonicalise(resOn.view, "view"));

        // F-6 Gutters & painted gaps: independently measure painted geometry from resOn.view.entityOccurrences.
        verifyF6PaintedGapsFromGeometry(scene, collapsed, resOn, `${scene.id}:${key}`);
      }

      // Plan cache reused the single nominal plan across all fold states
      const pStats = cacheOn.planStats();
      expect(pStats.planEntries, `${scene.id}:planEntries`).toBe(1);
      expect(pStats.planMisses, `${scene.id}:planMisses`).toBe(1);
      expect(pStats.planHits, `${scene.id}:planHits`).toBe(states.length - 1);

      // F-3 Locality: toggling a single container from nominal leaves every untouched non-inheriting container's
      // internal layout (child rects relative to container origin) byte-identical.
      const occToEntity = new Map<OccurrenceRef, EntityRef>();
      for (const occ of Object.values(nominal.view.entityOccurrences)) {
        occToEntity.set(occ.id, occ.entity);
      }
      for (const collapsed of states) {
        if (collapsed.length !== 1) continue;
        const toggledOcc = collapsed[0]!;
        const toggledEntity = occToEntity.get(toggledOcc);
        if (toggledEntity === undefined) continue;
        const foldedRes = resultsByKey.get(collapsed.join(","))!;
        const ancestors = ancestorsOf(scene.document, toggledEntity);
        const descendants = descendantsOf(scene.document, toggledEntity);
        const f3Changed = new Set<EntityRef>([toggledEntity, ...ancestors, ...descendants, ...inheritors]);

        for (const container of scene.containers) {
          if (f3Changed.has(container)) continue;
          const sigNom = relativeChildrenSignature(nominal, container, scene.document);
          const sigFold = relativeChildrenSignature(foldedRes, container, scene.document);
          expect(sigFold, `${scene.id}:F-3:${toggledEntity}->${container}`).toBe(sigNom);
        }

        // R-3 route-locality metric (reported, not gated)
        for (const relOcc of Object.values(nominal.view.relationOccurrences)) {
          const foldedRel = foldedRes.view.relationOccurrences[relOcc.id];
          if (relOcc.waypoints === undefined || foldedRel?.waypoints === undefined) continue;
          const srcOcc = relOcc.endpoints.find((e) => e.role === "source")?.occurrence;
          const tgtOcc = relOcc.endpoints.find((e) => e.role === "target")?.occurrence;
          if (srcOcc === undefined || tgtOcc === undefined) continue;
          const srcEnt = occToEntity.get(srcOcc);
          const tgtEnt = occToEntity.get(tgtOcc);
          if (srcEnt === undefined || tgtEnt === undefined) continue;
          if (f3Changed.has(srcEnt) || f3Changed.has(tgtEnt)) continue;
          const srcAnc = ancestorsOf(scene.document, srcEnt);
          const tgtAnc = ancestorsOf(scene.document, tgtEnt);
          if ([...srcAnc].some((a) => f3Changed.has(a)) || [...tgtAnc].some((a) => f3Changed.has(a))) continue;
          totalUntouchedEdges += 1;
          const nomSrcRect = nominal.view.entityOccurrences[srcOcc]!.geometry;
          const foldSrcRect = foldedRes.view.entityOccurrences[srcOcc]!.geometry;
          const dx = foldSrcRect.x - nomSrcRect.x;
          const dy = foldSrcRect.y - nomSrcRect.y;
          const shiftedMatch =
            relOcc.waypoints.length === foldedRel.waypoints.length &&
            relOcc.waypoints.every((pt, idx) => {
              const fpt = foldedRel.waypoints![idx]!;
              return Math.abs(pt.x + dx - fpt.x) <= TOL && Math.abs(pt.y + dy - fpt.y) <= TOL;
            });
          if (!shiftedMatch) routeLocalityChanged += 1;
        }
      }

      // F-4 Path independence: toggle sequences of length <= 3 feeding previousOrientation forward
      // directly through layoutMeasured with a shared nominal plan + subtree memo (NEVER short-circuited
      // by the result cache!) produce byte-identical canonical view bytes to computing each state cold.
      if (nominalPlan !== undefined) {
        const seqMemo = createSubtreeMemo();
        const planExec = { plan: nominalPlan, memo: seqMemo };
        // Cover EVERY state for scenes with <= 12 states; evenly cover 10 states across all fold depths for 52-state scenes.
        const sampleStates =
          states.length <= 12
            ? states
            : Array.from({ length: 10 }, (_, idx) => states[Math.floor((idx * (states.length - 1)) / 9)]!);
        for (let i = 0; i < sampleStates.length; i += 1) {
          const s1 = sampleStates[i]!;
          const s2 = sampleStates[(i + 1) % sampleStates.length]!;
          const s3 = sampleStates[(i + 2) % sampleStates.length]!;
          // Step 1: start from adversarial flipped previousOrientation -> s1
          const r1 = mustLayOut(
            layoutMeasured(
              scene.document,
              baseOptionsOf(scene, { collapsed: s1, previousOrientation: flippedNominalPrev }),
              scene.sourceView,
              planExec,
            ),
            `${scene.id}:seq:1`,
          );
          expect(canonicalise(r1.view, "view"), `${scene.id}:F-4:step1:${s1.join(",")}`).toBe(
            canonicalise(resultsByKey.get(s1.join(","))!.view, "view"),
          );
          // Step 2: s1 -> s2 feeding r1.orientations forward
          const r2 = mustLayOut(
            layoutMeasured(
              scene.document,
              baseOptionsOf(scene, {
                collapsed: s2,
                ...(r1.orientations === undefined ? {} : { previousOrientation: r1.orientations }),
              }),
              scene.sourceView,
              planExec,
            ),
            `${scene.id}:seq:2`,
          );
          expect(canonicalise(r2.view, "view"), `${scene.id}:F-4:step2:${s1.join(",")}->${s2.join(",")}`).toBe(
            canonicalise(resultsByKey.get(s2.join(","))!.view, "view"),
          );
          // Step 3a (returning): s1 -> s2 -> s1 feeding r2.orientations forward
          const r3Ret = mustLayOut(
            layoutMeasured(
              scene.document,
              baseOptionsOf(scene, {
                collapsed: s1,
                ...(r2.orientations === undefined ? {} : { previousOrientation: r2.orientations }),
              }),
              scene.sourceView,
              planExec,
            ),
            `${scene.id}:seq:3-ret`,
          );
          expect(canonicalise(r3Ret.view, "view"), `${scene.id}:F-4:ret:${s1.join(",")}->${s2.join(",")}->${s1.join(",")}`).toBe(
            canonicalise(resultsByKey.get(s1.join(","))!.view, "view"),
          );
          // Step 3b (non-returning): s1 -> s2 -> s3 feeding r2.orientations forward
          const r3Next = mustLayOut(
            layoutMeasured(
              scene.document,
              baseOptionsOf(scene, {
                collapsed: s3,
                ...(r2.orientations === undefined ? {} : { previousOrientation: r2.orientations }),
              }),
              scene.sourceView,
              planExec,
            ),
            `${scene.id}:seq:3-next`,
          );
          expect(canonicalise(r3Next.view, "view"), `${scene.id}:F-4:next:${s1.join(",")}->${s2.join(",")}->${s3.join(",")}`).toBe(
            canonicalise(resultsByKey.get(s3.join(","))!.view, "view"),
          );
        }
        // Confirm the subtree memo was genuinely exercised across the uncached sequence.
        expect(seqMemo.stats().hits, `${scene.id}:F-4:memo-exercised`).toBeGreaterThan(0);
      }
    }

    return { totalStates, totalUntouchedEdges, routeLocalityChanged };
  }

  it("enforces F-1, F-2, F-3, F-4, F-6 and memo on/off identity over Examples A & B and the 6 figkit twins (44 visible states)", () => {
    const figkitCounts = buildFigkitTwins().map(
      (scene) => enumerateVisibleFoldStates(scene.document, scene.containers, scene.sourceView).length,
    );
    expect(figkitCounts.reduce((a, b) => a + b, 0)).toBe(38);
    const metrics = verifyCorpusScenes([buildExampleA(), buildExampleB(), ...buildFigkitTwins()]);
    expect(metrics.totalStates).toBe(44);
    expect(Number.isFinite(metrics.totalUntouchedEdges)).toBe(true);
    expect(Number.isFinite(metrics.routeLocalityChanged)).toBe(true);
  }, 180_000);

  it("enforces F-1, F-2, F-3, F-4, F-6 and memo on/off identity over all visible fold states of composed appctx-architecture (52 states)", () => {
    const metrics = verifyCorpusScenes([buildAppctxArchitecture16x9()]);
    expect(metrics.totalStates).toBe(52);
    expect(Number.isFinite(metrics.totalUntouchedEdges)).toBe(true);
    expect(Number.isFinite(metrics.routeLocalityChanged)).toBe(true);
  }, 180_000);

  it("keeps zone gutters at token across every fold state of a v1-path twin of Example A (F-6)", () => {
    const exA = buildExampleA();
    const v1Entities = Object.fromEntries(
      Object.entries(exA.presentation.entities).map(([id, entry]) => [
        id,
        { form: entry.form, text: entry.text },
      ]),
    );
    const v1Presentation = {
      contractPin: { id: "diagram-presentation", version: "diagram-presentation@1", contentDigest: "0".repeat(64) },
      entities: v1Entities,
      legends: {},
      categoryTokens: [],
    } as unknown as NonNullable<LayoutOptions["presentation"]>;
    const states = enumerateVisibleFoldStates(exA.document, exA.containers);
    for (const collapsed of states) {
      const res = mustLayOut(
        layoutMeasured(exA.document, {
          ...baseOptionsOf(exA),
          presentation: v1Presentation,
          collapsed,
        }),
        `v1-exA:${collapsed.join(",")}`,
      );
      verifyF6PaintedGapsFromGeometry(exA, collapsed, res, `v1-exA:${collapsed.join(",")}`);
    }
  });

  it("skips DE-2 post-pass orientation retry on planned auto-packed levels even with channel-capacity-exceeded (F-2 / R-9)", () => {
    // Auto-packed container `host` holds 4 sibling containers `a, b, c, d` with 6 distinct-style
    // links crossing the fixed 96px zone gutter; with routeSpacing=28 & borderClearance=28,
    // channelCapacity(96, 28, 28) = floor((96 - 56) / 28) + 1 = 2, triggering channel-capacity-exceeded.
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
      id: "f2-no-retry",
      carries: ["F-2"],
      hintsV2,
      entities: [
        { id: "host", container: true, title: "Auto-Packed Host" },
        { id: "a", container: true, parent: "host", title: "Zone A" },
        { id: "a1", parent: "a", title: "A1" },
        { id: "b", container: true, parent: "host", title: "Zone B" },
        { id: "b1", parent: "b", title: "B1" },
        { id: "c", container: true, parent: "host", title: "Zone C" },
        { id: "c1", parent: "c", title: "C1" },
        { id: "d", container: true, parent: "host", title: "Zone D" },
        { id: "d1", parent: "d", title: "D1" },
      ],
      relations: [
        // Diagonal cross-shelf links run longitudinally through the fixed 96px horizontal zone gutter
        { id: "e1", source: "a1", target: "d1", strokeStyle: "solid" },
        { id: "e2", source: "a1", target: "d1", strokeStyle: "dashed" },
        { id: "e3", source: "c1", target: "b1", strokeStyle: "dotted" },
        { id: "e4", source: "c1", target: "b1", emphasis: "emphasis" },
        { id: "e5", source: "a1", target: "d1", arrowhead: "none" },
        { id: "e6", source: "c1", target: "b1", strokeStyle: "solid" },
      ],
    });
    // With routeSpacing=36 & borderClearance=36, channelCapacity(96, 36, 36) = 1.
    const tightMetrics = { routeSpacing: 36, routeBorderClearance: 36 };
    const nominal = mustLayOut(
      layoutMeasured(scene.document, baseOptionsOf(scene, { collapsed: [], metrics: tightMetrics })),
      "f2:nom",
    );
    const hostKey = occurrenceRef("e.host");
    const nominalHostOrient = nominal.orientations?.[hostKey];
    expect(nominalHostOrient).toBeDefined();

    // Fold a and b: planned level keeps nominalHostOrient (never triggers DE-2 post-pass retry)
    // and still reports channel-capacity-exceeded in routeSpacing and warnings.
    const folded = mustLayOut(
      layoutMeasured(
        scene.document,
        baseOptionsOf(scene, {
          collapsed: [occurrenceRef("e.a"), occurrenceRef("e.b")],
          metrics: tightMetrics,
        }),
      ),
      "f2:folded",
    );
    expect(folded.orientations?.[hostKey]).toBe(nominalHostOrient);
    const capConflicts = (folded.routeSpacing?.conflicts ?? []).filter((c) => c.kind === "channel-capacity-exceeded");
    expect(capConflicts.length).toBeGreaterThan(0);
    expect(folded.warnings.some((w) => w.code === "channel-capacity-exceeded")).toBe(true);
  });

  it("re-seats inheriting siblings and preserves non-inheriting stretched container internals across fold/unfold/refold with memo on & off (F-3, D-6)", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1", "s2"],
          transverse_bands: [
            { id: "r1", items: [entityRef("z1")] },
            { id: "r2", items: [entityRef("z2")] },
            { id: "r3", items: [entityRef("z3")] },
          ],
          cells: {
            [entityRef("z1")]: { column: "s1", to_column: "s2" },
            [entityRef("z2")]: { column: "s1", to_column: "s2" },
            [entityRef("z3")]: { column: "s1" },
          },
        },
        [entityRef("z1")]: {
          stage_columns: "inherit",
          transverse_bands: [{ id: "z1b", items: [entityRef("wide-box"), entityRef("z1-r")] }],
          cells: {
            [entityRef("wide-box")]: { column: "s1" },
            [entityRef("z1-r")]: { column: "s2" },
          },
        },
        [entityRef("z2")]: {
          stage_columns: "inherit",
          transverse_bands: [{ id: "z2b", items: [entityRef("z2-l"), entityRef("z2-r")] }],
          cells: {
            [entityRef("z2-l")]: { column: "s1" },
            [entityRef("z2-r")]: { column: "s2" },
          },
        },
      },
      stacks: {
        [entityRef("wide-box")]: { axis: "row" },
        [entityRef("z3")]: { axis: "column" },
      },
    };
    const scene = buildGenericScene({
      id: "inherit-f3-memo",
      carries: ["F-3", "D-6"],
      hintsV2,
      entities: [
        { id: "z1", container: true, title: "Zone 1 (Holds Wide Column 1)" },
        { id: "wide-box", container: true, parent: "z1", title: "Wide Container In S1" },
        { id: "w1", parent: "wide-box", title: "W1" },
        { id: "w2", parent: "wide-box", title: "W2" },
        { id: "z1-r", parent: "z1", title: "Z1 Right" },
        { id: "z2", container: true, title: "Zone 2 (Inheriting Sibling)" },
        { id: "z2-l", parent: "z2", title: "Z2 Left" },
        { id: "z2-r", parent: "z2", title: "Z2 Right" },
        { id: "z3", container: true, title: "Zone 3 (Non-Inheriting Stretched)" },
        { id: "z3-a", parent: "z3", title: "Z3 A" },
        { id: "z3-b", parent: "z3", title: "Z3 B" },
      ],
      relations: [],
    });

    const cacheOn = createLayoutCache({ maxEntries: 32, subtreeMemo: true });
    const cacheOff = createLayoutCache({ maxEntries: 32, subtreeMemo: false });
    const geom = (res: Extract<LayoutResult, { status: "laid-out" }>, local: string) =>
      res.view.entityOccurrences[occurrenceRef(`e.${local}`)]!.geometry;

    const z1Occ = [occurrenceRef("e.z1")];
    // Sequence: unfold -> fold z1 -> unfold -> refold z1
    const u1On = mustLayOut(cacheOn.layout(scene.document, baseOptionsOf(scene, { collapsed: [] })), "u1:on");
    const f1On = mustLayOut(cacheOn.layout(scene.document, baseOptionsOf(scene, { collapsed: z1Occ })), "f1:on");
    // Clear result cache (keep fresh cache / sequence test via different targetWidth or direct state check)
    const u2On = mustLayOut(cacheOn.layout(scene.document, baseOptionsOf(scene, { collapsed: [], targetWidth: 1200 })), "u2:on");
    const f2On = mustLayOut(cacheOn.layout(scene.document, baseOptionsOf(scene, { collapsed: z1Occ, targetWidth: 1200 })), "f2:on");

    const u1Off = mustLayOut(cacheOff.layout(scene.document, baseOptionsOf(scene, { collapsed: [] })), "u1:off");
    const f1Off = mustLayOut(cacheOff.layout(scene.document, baseOptionsOf(scene, { collapsed: z1Occ })), "f1:off");

    // Memo on vs off byte-identical on both unfolded and folded states
    expect(canonicalise(u1On.view, "view")).toBe(canonicalise(u1Off.view, "view"));
    expect(canonicalise(f1On.view, "view")).toBe(canonicalise(f1Off.view, "view"));
    // Unfold/refold produce exact same entity geometries
    expect(geom(u2On, "z2-l")).toEqual(geom(u1On, "z2-l"));
    expect(geom(u2On, "z2-r")).toEqual(geom(u1On, "z2-r"));
    expect(geom(f2On, "z2-l")).toEqual(geom(f1On, "z2-l"));
    expect(geom(f2On, "z2-r")).toEqual(geom(f1On, "z2-r"));

    // Folding z1 narrows s1, bringing z2's two cards closer together and centered on the new column axes within 1/64 px
    const distUnfolded = centerX(geom(u1On, "z2-r")) - centerX(geom(u1On, "z2-l"));
    const distFolded = centerX(geom(f1On, "z2-r")) - centerX(geom(f1On, "z2-l"));
    expect(distFolded).toBeLessThan(distUnfolded);

    const foldedCols = f1On.composition!.grids["root"]!.columns;
    expect(Math.abs(centerX(geom(f1On, "z2-l")) - (foldedCols[0]!.start + foldedCols[0]!.size / 2))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(geom(f1On, "z2-r")) - (foldedCols[1]!.start + foldedCols[1]!.size / 2))).toBeLessThanOrEqual(TOL);

    // Non-inheriting container z3 stretched in s1 narrows its frame with s1 while keeping its internal layout byte-identical
    expect(geom(f1On, "z3").width).toBeLessThan(geom(u1On, "z3").width);
    expect(relativeChildrenSignature(f1On, entityRef("z3"), scene.document)).toBe(
      relativeChildrenSignature(u1On, entityRef("z3"), scene.document),
    );
    expect(cacheOn.planStats().memoHits).toBeGreaterThan(0);

    // Same check on Example B folding layer-b: layer-a's cards move closer together, memo on/off identical
    const exB = buildExampleB();
    const bOn = createLayoutCache({ maxEntries: 16, subtreeMemo: true });
    const bOff = createLayoutCache({ maxEntries: 16, subtreeMemo: false });
    const bUnfoldOn = mustLayOut(bOn.layout(exB.document, baseOptionsOf(exB, { collapsed: [] })), "exB:u:on");
    const bFoldOn = mustLayOut(
      bOn.layout(exB.document, baseOptionsOf(exB, { collapsed: [occurrenceRef("e.layer-b")] })),
      "exB:f:on",
    );
    const bFoldOff = mustLayOut(
      bOff.layout(exB.document, baseOptionsOf(exB, { collapsed: [occurrenceRef("e.layer-b")] })),
      "exB:f:off",
    );
    expect(canonicalise(bFoldOn.view, "view")).toBe(canonicalise(bFoldOff.view, "view"));
    const axUnfold = geom(bUnfoldOn, "ax");
    const ayUnfold = geom(bUnfoldOn, "ay");
    const axFold = geom(bFoldOn, "ax");
    const ayFold = geom(bFoldOn, "ay");
    expect(centerX(ayFold) - centerX(axFold)).toBeLessThan(centerX(ayUnfold) - centerX(axUnfold));
  });

  it("derives the nominal plan key per S-1 (invariant across fold states & targetWidth, sensitive to all placement & legend inputs)", () => {
    const exA = buildExampleA();
    const nominalRes = mustLayOut(layoutMeasured(exA.document, baseOptionsOf(exA, { collapsed: [] })), "exA:base");
    const baseView = nominalRes.view;
    const baseOpts = baseOptionsOf(exA);
    const basePlanKey = computeCompositionPlanKey(exA.document, baseOpts, baseView);
    expect(basePlanKey).toBeDefined();

    // Equal across all fold states whether via `collapsed` OR via `projectView`-stamped fold groups
    for (const collapsed of enumerateVisibleFoldStates(exA.document, exA.containers, baseView)) {
      const viaCollapsed = computeCompositionPlanKey(exA.document, { ...baseOpts, collapsed }, baseView);
      expect(viaCollapsed, `collapsed:${collapsed.join(",")}`).toBe(basePlanKey);

      const stampedView: ViewDocument = projectView(exA.document, baseView, collapsed);
      const viaView = computeCompositionPlanKey(exA.document, baseOpts, stampedView);
      expect(viaView, `stamped:${collapsed.join(",")}`).toBe(basePlanKey);
    }

    // Unchanged by targetWidth and previousOrientation
    expect(computeCompositionPlanKey(exA.document, { ...baseOpts, targetWidth: 390 }, baseView)).toBe(basePlanKey);
    expect(
      computeCompositionPlanKey(
        exA.document,
        { ...baseOpts, previousOrientation: { root: "columns" } },
        baseView,
      ),
    ).toBe(basePlanKey);

    // Changed by composition
    const altHints = lowerLayoutHintsV2({
      ...(exA.hintsV2 as Extract<DsLayoutHintsV2, { mode: "stage-columns" }>),
      aspect: "16:9",
    });
    expect(computeCompositionPlanKey(exA.document, { ...baseOpts, hints: altHints }, baseView)).not.toBe(basePlanKey);

    // Changed by view filter
    const filteredView: ViewDocument = {
      ...baseView,
      filters: [{ id: "f1", kind: "exclude-entity", target: entityRef("m2") } as unknown as ViewDocument["filters"][number]],
    };
    expect(computeCompositionPlanKey(exA.document, baseOpts, filteredView)).not.toBe(basePlanKey);

    // Changed by layout metric
    expect(
      computeCompositionPlanKey(exA.document, { ...baseOpts, metrics: { rowGapInline: 120 } }, baseView),
    ).not.toBe(basePlanKey);

    // Changed by token
    expect(
      computeCompositionPlanKey(exA.document, baseOpts, baseView, { "--st-component-diagramZone-childGapInline": 42 }),
    ).not.toBe(basePlanKey);

    // Changed by legend inputs
    expect(computeCompositionPlanKey(exA.document, { ...baseOpts, legendTitle: "Key" }, baseView)).not.toBe(basePlanKey);
    expect(computeCompositionPlanKey(exA.document, { ...baseOpts, legend: "bottom" }, baseView)).not.toBe(basePlanKey);
    expect(
      computeCompositionPlanKey(exA.document, { ...baseOpts, legendLabels: { "dashed:arrow:default": "Proposed" } }, baseView),
    ).not.toBe(basePlanKey);

    // Changed by unversioned measurer that matches probe "Mm09 É—" but differs on legend title;
    // cache must compute a separate plan and separate legend rect.
    const makeMeasurer = (titleWidth: number): LineMeasurer => (req) => {
      if (req.text === "Legend") return { lines: ["Legend"], width: titleWidth, height: 18, overflow: false };
      return exA.measureLines(req);
    };
    const m1 = makeMeasurer(90);
    const m2 = makeMeasurer(340);
    const k1 = computeCompositionPlanKey(exA.document, { ...baseOpts, measureLines: m1 }, baseView);
    const k2 = computeCompositionPlanKey(exA.document, { ...baseOpts, measureLines: m2 }, baseView);
    expect(k1).not.toBe(k2);

    const cache = createLayoutCache();
    const r1 = mustLayOut(cache.layout(exA.document, { ...baseOpts, measureLines: m1 }, baseView), "m1");
    const r2 = mustLayOut(cache.layout(exA.document, { ...baseOpts, measureLines: m2 }, baseView), "m2");
    expect(cache.planStats().planEntries).toBe(2);
    expect(r1.linkLegend?.rect.width).not.toBe(r2.linkLegend?.rect.width);
  });

  it("Review P2 #3 & R1-1 (F-3 legend): hiding second style removes free-cell legend in s2, narrows s2 on the same call, and re-seats inheriting sibling with memo on & off", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      legend: "free-cell",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3"],
          transverse_bands: [
            { id: "r1", items: [entityRef("z-s1"), entityRef("c-s3")] },
            { id: "r2", items: [entityRef("sibling")] },
          ],
          cells: {
            [entityRef("z-s1")]: { column: "s1" },
            [entityRef("c-s3")]: { column: "s3" },
            [entityRef("sibling")]: { column: "s2", to_column: "s3" },
          },
        },
        [entityRef("sibling")]: {
          stage_columns: "inherit",
          transverse_bands: [{ id: "sb", items: [entityRef("sib-s2"), entityRef("sib-s3")] }],
          cells: {
            [entityRef("sib-s2")]: { column: "s2" },
            [entityRef("sib-s3")]: { column: "s3" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "f3-free-cell-legend-inherit",
      carries: ["H2.8", "F-3", "P2-3"],
      hintsV2,
      entities: [
        { id: "z-s1", container: true, title: "Style-2 Host In S1" },
        { id: "z-a", parent: "z-s1", title: "Inner A" },
        { id: "z-b", parent: "z-s1", title: "Inner B" },
        { id: "c-s3", title: "Top S3 Card" },
        { id: "sibling", container: true, title: "Sibling Inheriting S2..S3" },
        { id: "sib-s2", parent: "sibling", title: "Sib S2" },
        { id: "sib-s3", parent: "sibling", title: "Sib S3" },
      ],
      relations: [
        // Style 1: solid between root items
        { id: "e1", source: "sib-s2", target: "sib-s3", strokeStyle: "solid" },
        // Style 2: dashed strictly inside z-s1 -> folding z-s1 hides style 2!
        { id: "e2", source: "z-a", target: "z-b", strokeStyle: "dashed" },
      ],
    });
    const wideLegendTitle = "Very Long Free-Cell Legend Heading Wider Than Standard Card In Column S2";
    const opts = (collapsed: readonly OccurrenceRef[], targetWidth = 1440) =>
      baseOptionsOf(scene, { collapsed, legendTitle: wideLegendTitle, targetWidth });

    const cacheOn = createLayoutCache({ maxEntries: 32, subtreeMemo: true });
    const cacheOff = createLayoutCache({ maxEntries: 32, subtreeMemo: false });
    const foldZ = [occurrenceRef("e.z-s1")];

    const u1On = mustLayOut(cacheOn.layout(scene.document, opts([])), "u1:on");
    const f1On = mustLayOut(cacheOn.layout(scene.document, opts(foldZ)), "f1:on");
    // Unfold & refold with different targetWidth to miss result cache and exercise plan + subtree memo!
    const u2On = mustLayOut(cacheOn.layout(scene.document, opts([], 1200)), "u2:on");
    const f2On = mustLayOut(cacheOn.layout(scene.document, opts(foldZ, 1200)), "f2:on");

    const u1Off = mustLayOut(cacheOff.layout(scene.document, opts([])), "u1:off");
    const f1Off = mustLayOut(cacheOff.layout(scene.document, opts(foldZ)), "f1:off");

    // Memo on vs off byte-identical on both unfolded and folded states
    expect(canonicalise(u1On.view, "view")).toBe(canonicalise(u1Off.view, "view"));
    expect(canonicalise(f1On.view, "view")).toBe(canonicalise(f1Off.view, "view"));

    // Unfolded: free-cell legend sits in (r1, s2) as widest item of s2
    expect(u1On.linkLegend?.anchor).toBe("free-cell");
    const uS2 = u1On.composition!.grids["root"]!.columns.find((c) => c.id === "s2")!;
    expect(uS2.size).toBeGreaterThanOrEqual(u1On.linkLegend!.rect.width - TOL);

    // Folded on THAT VERY SAME CALL: legend disappears, s2 narrows, sibling's cards re-seat on new s2 & s3 axes!
    expect(f1On.linkLegend).toBeUndefined();
    const fS2 = f1On.composition!.grids["root"]!.columns.find((c) => c.id === "s2")!;
    const fS3 = f1On.composition!.grids["root"]!.columns.find((c) => c.id === "s3")!;
    expect(fS2.size).toBeLessThan(uS2.size);

    const geom = (r: Extract<LayoutResult, { status: "laid-out" }>, local: string) =>
      r.view.entityOccurrences[occurrenceRef(`e.${local}`)]!.geometry;
    expect(Math.abs(centerX(geom(f1On, "sib-s2")) - (fS2.start + fS2.size / 2))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(geom(f1On, "sib-s3")) - (fS3.start + fS3.size / 2))).toBeLessThanOrEqual(TOL);
    expect(centerX(geom(f1On, "sib-s3")) - centerX(geom(f1On, "sib-s2"))).toBeLessThan(
      centerX(geom(u1On, "sib-s3")) - centerX(geom(u1On, "sib-s2")),
    );

    // Fold -> unfold -> refold give exact same entity geometries with memo on
    expect(geom(u2On, "sib-s2")).toEqual(geom(u1On, "sib-s2"));
    expect(geom(u2On, "sib-s3")).toEqual(geom(u1On, "sib-s3"));
    expect(geom(f2On, "sib-s2")).toEqual(geom(f1On, "sib-s2"));
    expect(geom(f2On, "sib-s3")).toEqual(geom(f1On, "sib-s3"));
  });
});
