import { describe, expect, it } from "vitest";
import {
  layoutScene,
  resolveScene,
  type SceneLayoutInput,
  type SceneModel,
} from "../../src/presentation/diagramSceneModel.js";
import { projectedChainFixture } from "../../test-support/projectedChainFixture.js";

/**
 * E1 fold/unfold pin (REQ-R7-19, REQ-R7-05): the projected chain folds and
 * unfolds with relayout and link recompute on the shared seam the Svelte and
 * Vue hosts call, depth surfaces and the legend are restamped, and unfold
 * restores the unfolded geometry exactly.
 */
function inputOf(collapsed: readonly string[]): SceneLayoutInput {
  const f = projectedChainFixture();
  return {
    document: f.document,
    presentation: f.presentation,
    registry: f.registry,
    bindings: f.bindings,
    measureLines: f.measureLines,
    collapsed: collapsed as SceneLayoutInput["collapsed"],
    hints: { ordering: f.ordering, rootOrder: f.rootOrder },
    targetWidth: 1440,
  };
}

function sceneOf(collapsed: readonly string[]): SceneModel {
  const input = inputOf(collapsed);
  const result = layoutScene(input);
  if (result.status !== "laid-out") throw new Error("refused: " + JSON.stringify(result.refusals));
  return resolveScene(result, input);
}

describe("projected model chain E1 fold", () => {
  it("should hide the inner members and re-route the cross link when the inner zone folds", () => {
    const folded = sceneOf(["occurrence:e.workstream"]);
    const occurrences = new Set(folded.nodes.map((n) => n.occurrence));
    // Collapsed zone is still drawn (as a box); its members are hidden.
    expect(occurrences).toContain("occurrence:e.workstream");
    expect(occurrences).toContain("occurrence:e.project");
    expect(occurrences).toContain("occurrence:e.handoff");
    expect(occurrences).not.toContain("occurrence:e.parser");
    expect(occurrences).not.toContain("occurrence:e.planner");
    expect(occurrences).not.toContain("occurrence:e.renderer");

    const workstream = folded.nodes.find((n) => n.occurrence === "occurrence:e.workstream")!;
    expect(workstream.collapsed).toBe(true);

    // Links internal to the folded zone are gone; the cross link projects
    // onto the collapsed representative.
    expect(folded.edges.map((e) => e.occurrence)).toEqual(["occurrence:r.lnk-handoff"]);
  });

  it("should shrink the painted bounds on fold and restore them on unfold", () => {
    const unfolded = sceneOf([]);
    const folded = sceneOf(["occurrence:e.workstream"]);
    expect(folded.bounds).toBeDefined();
    expect(unfolded.bounds).toBeDefined();
    expect(folded.bounds!.height).toBeLessThan(unfolded.bounds!.height);

    // Unfold restores the exact unfolded geometry (engine + host agreement
    // within 1/64 px is pinned by the host contracts; here equality holds).
    const again = sceneOf([]);
    expect(again.bounds).toEqual(unfolded.bounds);
    expect(
      Object.fromEntries(again.nodes.map((n) => [n.occurrence, { ...n.rect }])),
    ).toEqual(Object.fromEntries(unfolded.nodes.map((n) => [n.occurrence, { ...n.rect }])));
    expect(again.edges).toEqual(unfolded.edges);
  });

  it("should restamp depth surfaces and the legend across fold/unfold", () => {
    const unfolded = sceneOf([]);
    const folded = sceneOf(["occurrence:e.workstream"]);
    // Outer zone depth is unchanged by the inner fold (lean stamps: the
    // top level carries no key, absent means `0`).
    expect(
      "depth" in (unfolded.nodes.find((n) => n.occurrence === "occurrence:e.project")!.presentation as object),
    ).toBe(false);
    expect(
      "depth" in (folded.nodes.find((n) => n.occurrence === "occurrence:e.project")!.presentation as object),
    ).toBe(false);
    // The folded bounds still cover the outer zone and the beside card.
    expect(folded.bounds!.width).toBeGreaterThan(0);
    expect(folded.bounds!.height).toBeGreaterThan(0);

    // The legend follows the visible styles: three states unfolded, the
    // single projected cross style folded (legend disappears).
    expect(unfolded.linkLegend).toBeDefined();
    expect(unfolded.linkLegend!.entries).toHaveLength(3);
    expect(folded.linkLegend).toBeUndefined();
  });

  it("should keep the cross link attached after fold and unfold", () => {
    for (const scene of [sceneOf([]), sceneOf(["occurrence:e.workstream"])]) {
      const cross = scene.edges.find((e) => e.occurrence === "occurrence:r.lnk-handoff");
      expect(cross).toBeDefined();
      expect(cross!.points.length).toBeGreaterThan(1);
    }
  });
});
