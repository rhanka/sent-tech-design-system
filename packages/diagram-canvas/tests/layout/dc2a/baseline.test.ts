/**
 * DC-2a L0 — fixtures and baseline (SPEC_EVOL_DC2A §7.4, §9.2).
 *
 * `baseline.json` holds the §7 metrics of the column placement — one column
 * per level, roots seated on the 56 px rank gap — measured by L0 on every view
 * of the ten cleared cases, and re-measured with the BF-3 escape probe just
 * before L2 removed that placement. It is the "before" of every DC-2a gate
 * and is kept as recorded: since AC-1 the engine packs every measured view,
 * so these numbers can no longer be produced by a call.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { placementMetrics, type PlacementMetrics } from "./rowpack-metrics.js";
import { CASE_IDS, layScene, sceneInput, viewNamesOf } from "./scenes.js";

const BASELINE = new URL("./baseline.json", import.meta.url);
const pinned = JSON.parse(readFileSync(BASELINE, "utf8")) as Record<string, PlacementMetrics>;

describe("DC-2a L0 baseline (column placement, as recorded)", () => {
  it("covers the ten cleared cases and their 31 views", () => {
    expect(CASE_IDS).toHaveLength(10);
    expect(Object.keys(pinned)).toEqual(CASE_IDS.flatMap((caseId) => viewNamesOf(caseId).map((viewName) => `${caseId}/${viewName}`)));
    expect(Object.keys(pinned)).toHaveLength(31);
    expect(viewNamesOf("case-b")).toEqual(["unfolded", "mesh-engram-folded", "folded"]);
    expect(viewNamesOf("vue-globale")).toEqual(["before", "intermediate", "after", "folded"]);
    expect(viewNamesOf("case-trackfocus-r9")).toEqual(["unfolded", "inner-folded", "folded"]);
  });

  it("records the same metrics the gates compute on the shipped engine", () => {
    const input = sceneInput("case-b", "unfolded");
    const now = placementMetrics(layScene(input, {}, { rootOrder: input.rootOrder }));
    for (const [key, metrics] of Object.entries(pinned)) expect(Object.keys(metrics), key).toEqual(Object.keys(now));
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
    const caseB = pinned["case-b/unfolded"]!;
    expect(caseB.singleColumnLevels).toBeGreaterThanOrEqual(1);
    expect(caseB.gapY.max).toBeGreaterThan(32);
    expect(caseB.aspectRatio).toBeLessThan(1);
    // case-skills-r9 unfolded: ten sibling cards stacked in one column.
    expect(pinned["case-skills-r9/unfolded"]!.aspectRatio).toBeLessThan(0.3);
    // No view of the baseline packs anything: every multi-sibling level is one column.
    expect(Object.values(pinned).reduce((sum, metrics) => sum + metrics.singleColumnLevels, 0)).toBe(83);
  });
});
