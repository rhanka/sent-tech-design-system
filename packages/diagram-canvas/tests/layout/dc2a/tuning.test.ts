/**
 * DC-2a §7.5 — tuning grid of the retained defaults over the 31 views (BF-5
 * moved it to L2; the §5.3 scale calibration is in tokens.test.ts).
 *
 * Grid: `tallBias ∈ {1.0, 1.6, 2.2} × emptyPenaltyWeight ∈ {0, 0.4, 0.8}` at
 * target aspect 1.78, with the pinned test `LineMeasurer`. Hard constraints
 * first (gap caps, no single-column level), then rank = Σ over the views of
 * four visible leaves or more of `logAspectError + (1 − fillRatio)`. The
 * numbers are pinned in `tuning.json`. A change of a default is a
 * default-value change with explained re-pins, never a code branch.
 *
 * The whole grid is 9 × 31 layouts plus 4 bands × 12 toggle sequences (about
 * three minutes): MAJ-4 always runs it in CI (rewritten with
 * `DC2A_WRITE_AFTER=1`). No environment flag gates the grid.
 */
import { readFileSync, writeFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DEFAULT_ROW_PACK } from "../../../src/index.js";
import { placementMetrics } from "./rowpack-metrics.js";
import { CASE_IDS, layScene, sceneInput, viewNamesOf, type CaseId, type SceneLayout } from "./scenes.js";

const TUNING = new URL("./tuning.json", import.meta.url);
const round = (value: number): number => Math.round(value * 1000) / 1000;
const views = CASE_IDS.flatMap((caseId) => viewNamesOf(caseId).map((viewName) => ({ caseId, viewName })));

interface GridCell {
  readonly tallBias: number;
  readonly emptyPenaltyWeight: number;
  /** Σ logAspectError + (1 − fillRatio), views of four visible leaves or more. Lower is better. */
  readonly rank: number;
  /** Hard constraints: gaps past the cap and single-column levels, summed. Any above 0 disqualifies. */
  readonly gapViolations: number;
  readonly singleColumnLevels: number;
  /** §7.3 gates the pair must not lose. */
  readonly aspectOver035: number;
  readonly labelUnplaced: number;
  readonly edgeContainerEscapes: number;
  readonly meanDisplayScale: number;
  readonly meanFrameFill: number;
}
interface Tuning {
  readonly grid: readonly GridCell[];
  readonly hysteresis: readonly { readonly band: number; readonly levelsChangingOnToggle: readonly string[]; readonly fixedPoint: boolean }[];
}

const FOLD_CASES: readonly CaseId[] = ["case-a", "case-b", "case-c", "case-d", "case-skills-r9", "case-integration-r9", "case-trackfocus-r9"];

// MAJ-4: the full 3×3 grid always runs in CI — no environment flag.
function computeGrid(): GridCell[] {
  const cells: GridCell[] = [];
  for (const tallBias of [1.0, 1.6, 2.2]) {
    for (const emptyPenaltyWeight of [0, 0.4, 0.8]) {
      let rank = 0;
      let gapViolations = 0;
      let singleColumnLevels = 0;
      let aspectOver035 = 0;
      let labelUnplaced = 0;
      let edgeContainerEscapes = 0;
      let display = 0;
      let frameFill = 0;
      for (const view of views) {
        const input = sceneInput(view.caseId, view.viewName);
        const metrics = placementMetrics(layScene(input, { rowPack: { tallBias, emptyPenaltyWeight } }, { rootOrder: input.rootOrder }));
        if (metrics.visibleLeaves >= 4) rank += metrics.logAspectError + (1 - metrics.fillRatio);
        if (metrics.gapX.max > 32.5 || metrics.gapY.max > 32.5) gapViolations += 1;
        singleColumnLevels += metrics.singleColumnLevels;
        if (metrics.visibleLeaves >= 9 && metrics.logAspectError > 0.35) aspectOver035 += 1;
        labelUnplaced += metrics.labelUnplaced;
        edgeContainerEscapes += metrics.edgeContainerEscapes;
        display += metrics.displayScale;
        frameFill += metrics.frameFillRatio;
      }
      cells.push({
        tallBias,
        emptyPenaltyWeight,
        rank: round(rank),
        gapViolations,
        singleColumnLevels,
        aspectOver035,
        labelUnplaced,
        edgeContainerEscapes,
        meanDisplayScale: round(display / views.length),
        meanFrameFill: round(frameFill / views.length),
      });
    }
  }
  return cells;
}

function computeHysteresis(): Tuning["hysteresis"] {
  return [0, 0.04, 0.08, 0.12].map((band) => {
    const changing: string[] = [];
    let fixedPoint = true;
    for (const caseId of FOLD_CASES) {
      const names = viewNamesOf(caseId);
      for (let index = 1; index < names.length; index += 1) {
        let previous: SceneLayout["orientations"] | undefined;
        const sequence: SceneLayout[] = [];
        for (const viewName of [names[index - 1]!, names[index]!, names[index - 1]!, names[index]!]) {
          const input = sceneInput(caseId, viewName);
          const layout = layScene(
            input,
            { rowPack: { orientationHysteresis: band }, ...(previous === undefined ? {} : { previousOrientation: previous }) },
            { rootOrder: input.rootOrder },
          );
          sequence.push(layout);
          previous = layout.orientations;
        }
        const [a1, b1, a2, b2] = sequence as [SceneLayout, SceneLayout, SceneLayout, SceneLayout];
        // O-5: the second visit of a state is the first.
        fixedPoint &&= JSON.stringify(a2.orientations) === JSON.stringify(a1.orientations) && JSON.stringify(b2.orientations) === JSON.stringify(b1.orientations);
        for (const key of Object.keys(a1.orientations)) {
          if (b1.orientations[key] !== undefined && b1.orientations[key] !== a1.orientations[key]) {
            changing.push(`${caseId} ${names[index - 1]!}↔${names[index]!} ${key}`);
          }
        }
      }
    }
    return { band, levelsChangingOnToggle: changing, fixedPoint };
  });
}

describe("DC-2a §7.5 tuning grid on the 31 views", () => {
  const recomputed: Tuning = { grid: computeGrid(), hysteresis: computeHysteresis() };
  if (process.env["DC2A_WRITE_AFTER"] === "1") writeFileSync(TUNING, `${JSON.stringify(recomputed, null, 2)}\n`);
  const computed = JSON.parse(readFileSync(TUNING, "utf8")) as Tuning;

  it("the pinned grid is the one the engine computes", () => {
    expect(computed.grid).toHaveLength(9);
    expect(computed.hysteresis.map((row) => row.band)).toEqual([0, 0.04, 0.08, 0.12]);
    // Every recomputed cell and band equals its pin (MAJ-4: always the full grid).
    for (const cell of recomputed.grid) {
      expect(computed.grid.find((pin) => pin.tallBias === cell.tallBias && pin.emptyPenaltyWeight === cell.emptyPenaltyWeight)).toEqual(cell);
    }
    for (const row of recomputed.hysteresis) expect(computed.hysteresis.find((pin) => pin.band === row.band)).toEqual(row);
    expect(recomputed.grid.length).toBe(9);
  });

  it("no pair of the grid breaks a hard constraint", () => {
    for (const cell of computed.grid) {
      expect([cell.gapViolations, cell.singleColumnLevels], `${String(cell.tallBias)} / ${String(cell.emptyPenaltyWeight)}`).toEqual([0, 0]);
    }
  });

  it("records the content-height calibration without retuning shipped defaults in a patch", () => {
    const defaults = computed.grid.find(
      (cell) => cell.tallBias === DEFAULT_ROW_PACK.tallBias && cell.emptyPenaltyWeight === DEFAULT_ROW_PACK.emptyPenaltyWeight,
    )!;
    expect(defaults).toBeDefined();
    // A challenger must rank strictly better AND lose nothing the gates measure.
    const winners = computed.grid.filter(
      (cell) =>
        cell !== defaults &&
        cell.rank < defaults.rank &&
        cell.aspectOver035 <= defaults.aspectOver035 &&
        cell.labelUnplaced <= defaults.labelUnplaced &&
        cell.edgeContainerEscapes <= defaults.edgeContainerEscapes &&
        cell.meanDisplayScale >= defaults.meanDisplayScale &&
        cell.meanFrameFill >= defaults.meanFrameFill,
    );
    // Card/footer growth changes this observational ranking. The hard
    // collision, containment, gap and readability gates above still hold.
    expect(winners.map((cell) => `${String(cell.tallBias)} / ${String(cell.emptyPenaltyWeight)}`)).toEqual(["1.6 / 0"]);
  });

  it("hysteresis: every band of the grid gives the same toggles on the scenes; the default band is retained", () => {
    // BLK-4: O-4 precedes O-3. Band 0 never keeps a previous orientation, so
    // the footprint-changing s2-h2a level flips there; every positive band
    // damps it to stable. The band itself is pinned on synthetic boxes (pack.test.ts, AC-17).
    for (const row of computed.hysteresis) {
      expect(row.fixedPoint, String(row.band)).toBe(true);
    }
    expect(computed.hysteresis.find((row) => row.band === 0)!.levelsChangingOnToggle).toEqual([
      "case-trackfocus-r9 unfolded↔inner-folded occurrence:e.s2-h2a",
    ]);
    for (const band of [0.04, 0.08, 0.12]) {
      expect(computed.hysteresis.find((row) => row.band === band)!.levelsChangingOnToggle, String(band)).toEqual([]);
    }
    expect(DEFAULT_ROW_PACK.orientationHysteresis).toBe(0.08);
  });
}, 600_000);
