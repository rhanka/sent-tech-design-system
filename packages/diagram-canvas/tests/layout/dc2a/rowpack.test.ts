/**
 * DC-2a L1 — row-pack gates on the ten scenes (SPEC_EVOL_DC2A §7.3, §8).
 *
 * "Before" is `baseline.json` (column placement, L0). "After" is the same
 * scenes laid out with `rowPack: {}` (DS defaults) and the `cards[]` root
 * order; its numbers are pinned in `after.json`. Regenerate on purpose only:
 * `DC2A_WRITE_AFTER=1 vitest run tests/layout/dc2a/rowpack.test.ts`.
 *
 * Every §7.3 gate is asserted with the threshold the spec states. Where the
 * shipped engine does not meet one, the views that miss it are pinned by name
 * with their numbers in the last block of this file, so nothing is omitted
 * and nothing is excused: a view joining or leaving a list turns the test red.
 */
import { readFileSync, writeFileSync } from "node:fs";

import { formatDiagnostics, m3ProfileRegistry, shippedExecutorBindings, validateView } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { DEFAULT_MIN_READABLE_SCALE, MIN_EDGE_LABEL_CSS_PX } from "../../../src/index.js";
import {
  BASE_GAP,
  EDGE_LABEL_FONT_SIZE,
  foldStability,
  frameFit,
  GAP_TOLERANCE,
  MAX_DISPLAY_SCALE,
  misalignedLevels,
  placementMetrics,
  segmentsThrough,
  siblingGaps,
  type PlacementMetrics,
} from "./rowpack-metrics.js";
import { CASE_IDS, layScene, sceneInput, viewNamesOf, type CaseId, type SceneLayout } from "./scenes.js";

const BASELINE = new URL("./baseline.json", import.meta.url);
const AFTER = new URL("./after.json", import.meta.url);
const GAP_CAP = 32;

type Orientations = Readonly<Record<string, "rows" | "columns">>;

const packed = (caseId: CaseId, viewName: string, previousOrientation?: Orientations): SceneLayout => {
  const input = sceneInput(caseId, viewName);
  return layScene(
    input,
    { rowPack: {}, ...(previousOrientation === undefined ? {} : { previousOrientation }) },
    { rootOrder: input.rootOrder },
  );
};

const views: { readonly key: string; readonly caseId: CaseId; readonly viewName: string }[] = CASE_IDS.flatMap((caseId) =>
  viewNamesOf(caseId).map((viewName) => ({ key: `${caseId}/${viewName}`, caseId, viewName })),
);
const layouts = new Map(views.map((view) => [view.key, packed(view.caseId, view.viewName)] as const));
const after: Record<string, PlacementMetrics> = Object.fromEntries(
  views.map((view) => [view.key, placementMetrics(layouts.get(view.key)!)]),
);
if (process.env["DC2A_WRITE_AFTER"] === "1") writeFileSync(AFTER, `${JSON.stringify(after, null, 2)}\n`);
const before = JSON.parse(readFileSync(BASELINE, "utf8")) as Record<string, PlacementMetrics>;

/** Lettered cases: their views are fold states of one dossier (§6.5). Transition scenes are separate source views. */
const FOLD_CASES: readonly CaseId[] = ["case-a", "case-b", "case-c", "case-d", "case-skills-r9", "case-integration-r9", "case-trackfocus-r9"];

/** A fold toggle sequence `A → B → A → B` with the emitted orientation map fed forward (O-4), as a host does. */
const toggle = (caseId: CaseId, a: string, b: string): SceneLayout[] => {
  const out: SceneLayout[] = [];
  let previous: Orientations | undefined;
  for (const viewName of [a, b, a, b]) {
    const layout = packed(caseId, viewName, previous);
    out.push(layout);
    previous = layout.orientations;
  }
  return out;
};

describe("DC-2a L1 row-pack gates", () => {
  it("matches the pinned after numbers", () => {
    expect(after).toEqual(JSON.parse(readFileSync(AFTER, "utf8")));
  });

  it("AC-19/AC-3: every sibling gap, root included, is within [base, cap] on both axes", () => {
    const violations: string[] = [];
    for (const view of views) {
      for (const gap of siblingGaps(layouts.get(view.key)!)) {
        if (gap.gap < BASE_GAP - GAP_TOLERANCE || gap.gap > GAP_CAP + GAP_TOLERANCE) {
          violations.push(`${view.key} ${gap.level} ${gap.axis} ${gap.before}→${gap.after} = ${gap.gap}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("AC-24: no empty lane — a gutter wider than the base gap is crossed by a routed edge or a label", () => {
    const lanes = views.filter((view) => after[view.key]!.emptyLanes > 0).map((view) => view.key);
    expect(lanes).toEqual([]);
  });

  it("AC-24/§3.5: a gutter is wider than the base gap only where a placed label sits in it", () => {
    // A bare route needs two clearances (16 px), which the base gap already
    // gives: only a label box justifies a wider gutter, pair by pair.
    const violations: string[] = [];
    for (const view of views) {
      for (const gap of siblingGaps(layouts.get(view.key)!)) {
        if (gap.gap > BASE_GAP + GAP_TOLERANCE && !gap.labelled) {
          violations.push(`${view.key} ${gap.level} ${gap.axis} ${gap.before}→${gap.after} = ${gap.gap}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("§3.5/P-7: a widened gutter never shifts one shelf against the others — columns stay aligned", () => {
    const violations = views.flatMap((view) => misalignedLevels(layouts.get(view.key)!).map((level) => `${view.key} ${level}`));
    expect(violations).toEqual([]);
  });

  it("AC-25: case-skills-r9 unfolded gutters are 24 px without a label and at most 32 px with one", () => {
    const gaps = siblingGaps(layouts.get("case-skills-r9/unfolded")!).filter((gap) => gap.level === "method-skills");
    expect(gaps.length).toBeGreaterThanOrEqual(9);
    for (const gap of gaps) {
      expect(gap.gap).toBeLessThanOrEqual(GAP_CAP + GAP_TOLERANCE);
      if (!gap.labelled) expect(Math.abs(gap.gap - BASE_GAP)).toBeLessThanOrEqual(GAP_TOLERANCE);
    }
    // The ten cards of the group share their column starts on every row.
    const skills = layouts.get("case-skills-r9/unfolded")!;
    const cards = skills.input.visible.filter((id) => skills.parentOf.get(id) === "method-skills");
    const starts = new Map<number, Set<number>>();
    for (const id of cards) {
      const rect = skills.rects.get(id)!;
      const row = [...new Set(cards.map((other) => skills.rects.get(other)!.y))].sort((left, right) => left - right);
      const column = cards.filter((other) => skills.rects.get(other)!.y === rect.y && skills.rects.get(other)!.x < rect.x).length;
      expect(row.length).toBeGreaterThan(1);
      (starts.get(column) ?? starts.set(column, new Set()).get(column)!).add(rect.x);
    }
    for (const [column, xs] of starts) expect([...xs], `column ${String(column)}`).toHaveLength(1);
  });

  it("no route runs through the title band of an expanded zone", () => {
    const violations: string[] = [];
    for (const view of views) {
      const layout = layouts.get(view.key)!;
      for (const hit of segmentsThrough(layout, [...layout.titleBands.values()])) {
        violations.push(`${view.key} ${hit.route} segment ${String(hit.segment)}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("case-trackfocus-r9 unfolded: no route runs through a title band or through a card", () => {
    const metrics = after["case-trackfocus-r9/unfolded"]!;
    expect([metrics.titleBandCrossings, metrics.edgeCardCrossings]).toEqual([0, 0]);
  });

  it("no view draws more routes through cards than the column baseline did", () => {
    const violations = views
      .filter((view) => after[view.key]!.edgeCardCrossings > before[view.key]!.edgeCardCrossings)
      .map((view) => `${view.key} ${String(before[view.key]!.edgeCardCrossings)} → ${String(after[view.key]!.edgeCardCrossings)}`);
    expect(violations).toEqual(ROUTES_THROUGH_CARDS);
  });

  it("AC-2/BF-1: no level of two siblings or more is stacked in one single vertical column", () => {
    const violations: string[] = [];
    for (const view of views) {
      const layout = layouts.get(view.key)!;
      expect(after[view.key]!.singleColumnLevels, view.key).toBe(0);
      const levels = new Map<string, string[]>();
      for (const [id, parent] of layout.parentOf) (levels.get(parent ?? "root") ?? levels.set(parent ?? "root", []).get(parent ?? "root")!).push(id);
      for (const [level, members] of levels) {
        if (members.length < 2) continue;
        const key = level === "root" ? "root" : `occurrence:e.${level}`;
        const oneColumn = members.every((id) => Math.abs(layout.rects.get(id)!.x - layout.rects.get(members[0]!)!.x) <= GAP_TOLERANCE);
        if (layout.orientations[key] === undefined) violations.push(`${view.key} ${level}: no orientation emitted`);
        if (oneColumn) violations.push(`${view.key} ${level}: ${String(members.length)} siblings in one column (${layout.orientations[key] ?? "?"})`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("§7.3 small views: two cards alone draw the admissible optimum, one row of two", () => {
    // The column baseline of a two-card view (460 × 424) is the stack BF-1
    // forbids; its aspect is no reference. The gate is the admissible optimum.
    const pairs = views.filter((view) => after[view.key]!.visible === 2);
    expect(pairs.map((view) => view.key)).toEqual(["case-c/folded", "case-d/folded", "case-skills-r9/folded"]);
    for (const view of pairs) {
      const metrics = after[view.key]!;
      expect([metrics.bboxWidth, metrics.bboxHeight], view.key).toEqual([944, 200]);
    }
  });

  it("AC-20: every view moves toward 16:9 and fills more of the frame than the column baseline", () => {
    const violations: string[] = [];
    for (const view of views) {
      const a = after[view.key]!;
      const b = before[view.key]!;
      // A single visible box has one possible drawing; two cards alone are gated above.
      if (a.visible <= 2) continue;
      if (!(a.logAspectError < b.logAspectError)) violations.push(`${view.key} aspect ${a.logAspectError} !< ${b.logAspectError}`);
      // Frame fill compares only where the fit constrained the baseline: a
      // view already at the maximum display scale fills by its area alone,
      // and a tighter drawing of the same cards is not a regression.
      if (b.frameScale < MAX_DISPLAY_SCALE && !(a.frameFillRatio > b.frameFillRatio)) {
        violations.push(`${view.key} frame fill ${a.frameFillRatio} !> ${b.frameFillRatio}`);
      }
      if (!(a.frameScale >= b.frameScale)) violations.push(`${view.key} frame scale ${a.frameScale} !>= ${b.frameScale}`);
      if (!(a.displayScale >= b.displayScale)) violations.push(`${view.key} display scale ${a.displayScale} !>= ${b.displayScale}`);
    }
    expect(violations).toEqual([]);
  });

  it("§7.3 scene band: strictly smaller than the baseline on Y; within the gap cap on X", () => {
    const violations: string[] = [];
    for (const view of views) {
      const a = after[view.key]!;
      const b = before[view.key]!;
      // A baseline band of 0 (one root container covers the axis) cannot be beaten: it must stay 0.
      if (b.sceneBandY === 0 ? a.sceneBandY !== 0 : !(a.sceneBandY < b.sceneBandY)) {
        violations.push(`${view.key} band Y ${a.sceneBandY} !< ${b.sceneBandY}`);
      }
      // The column baseline has no X band by construction (one column): the
      // packed drawing may show one sibling gutter, never more than the cap.
      if (a.sceneBandX > GAP_CAP + GAP_TOLERANCE) violations.push(`${view.key} band X ${a.sceneBandX} > ${GAP_CAP}`);
    }
    expect(violations).toEqual([]);
  });

  it("AC-4: siblings keep the cards[] reading order at the root and in every zone", () => {
    const violations: string[] = [];
    for (const view of views) {
      const layout = layouts.get(view.key)!;
      const levels = new Map<string, string[]>();
      for (const id of layout.input.visible) {
        const parent = layout.parentOf.get(id) ?? "root";
        (levels.get(parent) ?? levels.set(parent, []).get(parent)!).push(id);
      }
      for (const [level, members] of levels) {
        const key = level === "root" ? "root" : `occurrence:e.${level}`;
        const rows = layout.orientations[key] !== "columns";
        const read = [...members].sort((left, right) => {
          const a = layout.rects.get(left)!;
          const b = layout.rects.get(right)!;
          return rows ? a.y - b.y || a.x - b.x : a.x - b.x || a.y - b.y;
        });
        if (read.join(",") !== members.join(",")) violations.push(`${view.key} ${level}: ${read.join(",")}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("AC-10: cards and collapsed zones stay 460 × 200; no visible leaf overlaps another", () => {
    for (const view of views) {
      const layout = layouts.get(view.key)!;
      const leaves = layout.input.leaves.map((id) => layout.rects.get(id)!);
      for (const rect of leaves) expect([rect.width, rect.height]).toEqual([460, 200]);
      leaves.forEach((a, index) => {
        for (const b of leaves.slice(index + 1)) {
          const apart = a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
          expect(apart, view.key).toBe(true);
        }
      });
    }
  });

  it("AC-9/W-6: every view, folded ones included, passes validateView with zero diagnostics", () => {
    for (const view of views) {
      const layout = layouts.get(view.key)!;
      const diagnostics = validateView(layout.view, layout.input.document, {
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
      });
      expect(formatDiagnostics(diagnostics), view.key).toBe("");
    }
  });

  it("AC-7/AC-17: identical inputs give identical bytes and the emitted orientation map is a fixed point", () => {
    for (const view of views) {
      const first = layouts.get(view.key)!;
      const again = packed(view.caseId, view.viewName);
      expect(JSON.stringify(again.view)).toBe(JSON.stringify(first.view));
      const fed = packed(view.caseId, view.viewName, first.orientations);
      expect(fed.orientations).toEqual(first.orientations);
      expect(JSON.stringify(fed.view)).toBe(JSON.stringify(first.view));
    }
  }, 120_000);

  it("AC-16: the orientation of a level follows the fold state through a real toggle (case-trackfocus-r9)", () => {
    // unfolded → inner-folded → unfolded → inner-folded, the emitted map fed
    // forward each time. `s2-h2a` holds two zones and a card when unfolded
    // (columns wins outside the band) and three equal cards when its zones
    // fold: both forms then fill the same 944 × 424 box, so the level reads
    // rows again instead of staying columns because the last state was.
    const key = "occurrence:e.s2-h2a";
    const sequence = toggle("case-trackfocus-r9", "unfolded", "inner-folded");
    expect(sequence.map((layout) => layout.orientations[key])).toEqual(["columns", "rows", "columns", "rows"]);
    // With the map fed forward each state draws what it draws alone.
    expect(JSON.stringify(sequence[1]!.view)).toBe(JSON.stringify(layouts.get("case-trackfocus-r9/inner-folded")!.view));
    expect(JSON.stringify(sequence[2]!.view)).toBe(JSON.stringify(layouts.get("case-trackfocus-r9/unfolded")!.view));
  });

  it("AC-8/AC-17/O-5: every fold toggle A → B → A → B repeats byte for byte, the orientation map fed forward", () => {
    const alternations: string[] = [];
    for (const caseId of FOLD_CASES) {
      const names = viewNamesOf(caseId);
      for (let index = 1; index < names.length; index += 1) {
        const a = names[index - 1]!;
        const b = names[index]!;
        const [a1, b1, a2, b2] = toggle(caseId, a, b) as [SceneLayout, SceneLayout, SceneLayout, SceneLayout];
        // S-3/O-5: the second visit of a state is the first, bytes and orientations.
        expect(JSON.stringify(a2.view), `${caseId} ${a} (second visit)`).toBe(JSON.stringify(a1.view));
        expect(JSON.stringify(b2.view), `${caseId} ${b} (second visit)`).toBe(JSON.stringify(b1.view));
        expect(a2.orientations).toEqual(a1.orientations);
        expect(b2.orientations).toEqual(b1.orientations);
        for (const key of Object.keys(a1.orientations)) {
          if (b1.orientations[key] !== undefined && b1.orientations[key] !== a1.orientations[key]) {
            alternations.push(`${caseId} ${a}↔${b} ${key}: ${a1.orientations[key]!}↔${b1.orientations[key]!}`);
          }
        }
      }
    }
    // The only level that changes orientation on a toggle is the one whose
    // footprints change (AC-16): no level alternates inside the band.
    expect(alternations).toEqual(["case-trackfocus-r9 unfolded↔inner-folded occurrence:e.s2-h2a: columns↔rows"]);
  }, 120_000);

  it("AC-8/S-1: a fold toggle moves no sibling inside a level it leaves unchanged", () => {
    let levels = 0;
    for (const caseId of FOLD_CASES) {
      const names = viewNamesOf(caseId);
      for (let index = 1; index < names.length; index += 1) {
        const [a, b] = toggle(caseId, names[index - 1]!, names[index]!) as [SceneLayout, SceneLayout, SceneLayout, SceneLayout];
        const stability = foldStability(a, b);
        levels += stability.levels;
        expect(stability.moved, `${caseId} ${names[index - 1]!}→${names[index]!}`).toEqual([]);
        expect(stability.max).toBe(0);
      }
    }
    expect(levels).toBeGreaterThan(0);
  });

  it("§5.1/§5.3: the display scale comes from cameraFit, holds the readability floor, and labels stay legible", () => {
    // 18 px edge labels render at 18 × 0.45 = 8.1 CSS px at the floor.
    expect(EDGE_LABEL_FONT_SIZE * DEFAULT_MIN_READABLE_SCALE).toBeGreaterThanOrEqual(MIN_EDGE_LABEL_CSS_PX);
    const panning: string[] = [];
    for (const view of views) {
      const metrics = after[view.key]!;
      const layout = layouts.get(view.key)!;
      expect(metrics.displayScale, view.key).toBeGreaterThanOrEqual(DEFAULT_MIN_READABLE_SCALE);
      expect(metrics.displayScale, view.key).toBeLessThanOrEqual(MAX_DISPLAY_SCALE);
      expect(metrics.edgeLabelCssPx, view.key).toBeGreaterThanOrEqual(MIN_EDGE_LABEL_CSS_PX);
      // The frame scale is the shipped fit of the entity bbox, not a harness formula.
      const rects = [...layout.rects.values()];
      const width = Math.max(...rects.map((rect) => rect.x + rect.width)) - Math.min(...rects.map((rect) => rect.x));
      const height = Math.max(...rects.map((rect) => rect.y + rect.height)) - Math.min(...rects.map((rect) => rect.y));
      expect(metrics.frameScale, view.key).toBeCloseTo(frameFit({ width, height }).zoomFit, 3);
      if (metrics.pans) panning.push(`${view.key} ${String(metrics.displayScale)}`);
    }
    // Views larger than the floor allows are held at the floor and pan (BF-2), by name.
    expect(panning).toEqual(PANNING_VIEWS);
  });

  it("AC-21 report: labels the capped gutters cannot hold are named, never given a wider gutter", () => {
    // Informative at L1 (the zero-unplaced gate is L3): the row-packed scenes
    // must not lose label placements against the column baseline.
    let unplacedBefore = 0;
    let unplacedAfter = 0;
    for (const view of views) {
      unplacedBefore += before[view.key]!.labelUnplaced;
      unplacedAfter += after[view.key]!.labelUnplaced;
      expect(after[view.key]!.labelCardOverlaps, view.key).toBe(0);
    }
    expect(unplacedAfter).toBeLessThan(unplacedBefore);
  });

  it("a folded view places no fewer labels than the column baseline", () => {
    const worse = views
      .filter((view) => view.viewName.includes("folded") && after[view.key]!.labelUnplaced > before[view.key]!.labelUnplaced)
      .map((view) => `${view.key} ${String(before[view.key]!.labelUnplaced)} → ${String(after[view.key]!.labelUnplaced)}`);
    expect(worse).toEqual(FOLDED_LABEL_LOSSES);
  });
});

/**
 * §7.3 gates the shipped engine does not meet, with the spec's own thresholds
 * and the views that miss them, by name and number. Each list is an open item
 * recorded for arbitration in the spec (Appendix E, §7.4), not an exemption:
 * the thresholds are not edited, and any change of a list turns the test red.
 */
const ROUTES_THROUGH_CARDS: readonly string[] = [];
const PANNING_VIEWS: readonly string[] = [];
const FOLDED_LABEL_LOSSES: readonly string[] = [];
const ASPECT_OVER_035: readonly string[] = [];
const FILL_UNDER_BASELINE_PLUS_010: readonly string[] = [];

describe("DC-2a §7.3 gates in arbitration (spec thresholds, misses named)", () => {
  it("§7.3 root aspect: views with nine visible leaves or more land within 0.35 of the 16:9 log aspect", () => {
    const violations = views
      .filter((view) => after[view.key]!.visibleLeaves >= 9 && after[view.key]!.logAspectError > 0.35)
      .map((view) => `${view.key} ${String(after[view.key]!.logAspectError)}`);
    expect(violations).toEqual(ASPECT_OVER_035);
  });

  it("§7.3 fill: cluster-scale views reach the column baseline fill + 0.10", () => {
    // fillRatio = visible-leaf areas / entity bbox area. The column baseline
    // stacks one zone per row, so its bbox is one zone wide and holds almost
    // no slack; the +0.10 direction is recorded against it as written.
    const violations = views
      .filter((view) => after[view.key]!.visibleLeaves >= 9 && !(after[view.key]!.fillRatio >= before[view.key]!.fillRatio + 0.1))
      .map((view) => `${view.key} ${String(before[view.key]!.fillRatio)} → ${String(after[view.key]!.fillRatio)}`);
    expect(violations).toEqual(FILL_UNDER_BASELINE_PLUS_010);
  });
});
