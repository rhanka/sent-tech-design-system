/**
 * DC-2a L0 — fixtures and baseline (SPEC_EVOL_DC2A §7.4, §9.2).
 *
 * Runs the §7 metrics over the engine's column placement (no `rowPack`
 * option) for every view of the ten cleared cases and compares them with the
 * committed `baseline.json`. The baseline is the "before" of every DC-2a gate.
 * Regenerate it only on purpose: `DC2A_WRITE_BASELINE=1 vitest run
 * tests/layout/dc2a/baseline.test.ts`.
 */
import { readFileSync, writeFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { placementMetrics, type PlacementMetrics } from "./rowpack-metrics.js";
import { CASE_IDS, layScene, sceneInput, viewNamesOf } from "./scenes.js";

const BASELINE = new URL("./baseline.json", import.meta.url);

export function computeAll(
  lay: (caseId: (typeof CASE_IDS)[number], viewName: string) => PlacementMetrics,
): Record<string, PlacementMetrics> {
  const out: Record<string, PlacementMetrics> = {};
  for (const caseId of CASE_IDS) {
    for (const viewName of viewNamesOf(caseId)) out[`${caseId}/${viewName}`] = lay(caseId, viewName);
  }
  return out;
}

describe("DC-2a L0 baseline (column placement)", () => {
  const computed = computeAll((caseId, viewName) => placementMetrics(layScene(sceneInput(caseId, viewName))));
  if (process.env["DC2A_WRITE_BASELINE"] === "1") {
    writeFileSync(BASELINE, `${JSON.stringify(computed, null, 2)}\n`);
  }

  it("covers the ten cleared cases and their 31 views", () => {
    expect(CASE_IDS).toHaveLength(10);
    expect(Object.keys(computed)).toHaveLength(31);
    expect(viewNamesOf("case-b")).toEqual(["unfolded", "mesh-engram-folded", "folded"]);
    expect(viewNamesOf("vue-globale")).toEqual(["before", "intermediate", "after", "folded"]);
    expect(viewNamesOf("case-trackfocus-r9")).toEqual(["unfolded", "inner-folded", "folded"]);
  });

  it("matches the committed baseline numbers", () => {
    const pinned = JSON.parse(readFileSync(BASELINE, "utf8")) as Record<string, PlacementMetrics>;
    expect(computed).toEqual(pinned);
  });

  it("derives the reading order from cards[] order and hides folded members", () => {
    const skills = sceneInput("case-skills-r9", "unfolded");
    expect(skills.rootOrder).toEqual(["entity:method-skills", "entity:method-runtime"]);
    expect(skills.ordering["entity:method-skills" as never]).toHaveLength(10);
    expect(skills.links).toHaveLength(2);
    const folded = sceneInput("ajout-preprod", "folded");
    expect(folded.visible).toHaveLength(3);
    expect(folded.leaves).toHaveLength(3);
  });

  it("shows the defect the owner rejected: one column per level and root bands", () => {
    // case-b unfolded: three systems in one column, separated by the 56 px rank gap.
    const caseB = computed["case-b/unfolded"]!;
    expect(caseB.singleColumnLevels).toBeGreaterThanOrEqual(1);
    expect(caseB.gapY.max).toBeGreaterThan(32);
    expect(caseB.aspectRatio).toBeLessThan(1);
    // case-skills-r9 unfolded: ten sibling cards stacked in one column.
    expect(computed["case-skills-r9/unfolded"]!.aspectRatio).toBeLessThan(0.3);
  });
});
