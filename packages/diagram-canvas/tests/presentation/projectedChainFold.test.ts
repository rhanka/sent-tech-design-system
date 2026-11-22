import { describe, expect, it } from "vitest";
import { validateView } from "@sentropic/diagram-core";
import {
  layoutScene,
  resolveScene,
  type SceneLaidOut,
  type SceneLayoutInput,
  type SceneModel,
  type SceneOccurrenceRef,
} from "../../src/presentation/diagramSceneModel.js";
import {
  PROJECTED_CHAIN_TARGET_WIDTH,
  projectedChainFixture,
} from "../../test-support/projectedChainFixture.js";

/**
 * E1 fold/unfold pin (REQ-R7-19, REQ-R7-05): the projected chain folds and
 * unfolds both the inner zone (`occurrence:e.workstream`) and the outer zone
 * (`occurrence:e.project`) with relayout, link recompute, `0` route-spacing
 * conflicts across every fold state, depth and legend restamping, valid views,
 * and exact unfold symmetry.
 */
function inputOf(collapsed: readonly SceneOccurrenceRef[]): SceneLayoutInput {
  const f = projectedChainFixture();
  return {
    document: f.document,
    presentation: f.presentation,
    registry: f.registry,
    bindings: f.bindings,
    measureLines: f.measureLines,
    collapsed,
    hints: f.hints,
    targetWidth: PROJECTED_CHAIN_TARGET_WIDTH,
  };
}

function layoutAndSceneOf(collapsed: readonly SceneOccurrenceRef[]): {
  laid: SceneLaidOut;
  scene: SceneModel;
} {
  const input = inputOf(collapsed);
  const result = layoutScene(input);
  if (result.status !== "laid-out") throw new Error("refused: " + JSON.stringify(result.refusals));
  return { laid: result, scene: resolveScene(result, input) };
}

describe("projected model chain E1 fold", () => {
  it("should hide the inner members and re-route the cross link when the inner zone folds", () => {
    const f = projectedChainFixture();
    const unfolded = layoutAndSceneOf([]).scene;
    const { scene: folded } = layoutAndSceneOf([f.foldOccurrence]);
    const occurrences = new Set(folded.nodes.map((n) => n.occurrence));
    expect(occurrences).toContain("occurrence:e.workstream");
    expect(occurrences).toContain("occurrence:e.project");
    expect(occurrences).toContain("occurrence:e.handoff");
    expect(occurrences).not.toContain("occurrence:e.parser");
    expect(occurrences).not.toContain("occurrence:e.planner");
    expect(occurrences).not.toContain("occurrence:e.renderer");

    const workstream = folded.nodes.find((n) => n.occurrence === f.foldOccurrence)!;
    expect(workstream.collapsed).toBe(true);
    expect([workstream.rect.width, workstream.rect.height]).toEqual([352, 154]);
    expect(workstream.presentation?.depth).toBe(1);

    // Internal links disappear; the cross link projects onto the collapsed representative with a recomputed route.
    expect(folded.edges.map((e) => e.occurrence)).toEqual(["occurrence:r.lnk-handoff"]);
    expect(folded.edges[0]!.points).not.toEqual(
      unfolded.edges.find((e) => e.occurrence === "occurrence:r.lnk-handoff")!.points,
    );
  });

  it("should hide all descendants, edges and legend when the outer zone folds and restore exact geometry on unfold", () => {
    const f = projectedChainFixture();
    const unfolded = layoutAndSceneOf([]).scene;
    const { scene: outerFolded } = layoutAndSceneOf([f.outerFoldOccurrence]);

    expect(outerFolded.nodes.map((n) => n.occurrence)).toEqual([f.outerFoldOccurrence]);
    const project = outerFolded.nodes[0]!;
    expect(project.collapsed).toBe(true);
    expect([project.rect.width, project.rect.height]).toEqual([352, 154]);
    expect("depth" in (project.presentation as object), "outer depth stays top-level").toBe(false);
    expect(outerFolded.edges).toEqual([]);
    expect(outerFolded.linkLegend).toBeUndefined();
    expect(outerFolded.bounds!.height).toBeLessThan(unfolded.bounds!.height);
    expect(outerFolded.bounds!.width).toBeLessThan(unfolded.bounds!.width);

    const reopened = layoutAndSceneOf([]).scene;
    expect(reopened.bounds).toEqual(unfolded.bounds);
    expect(
      Object.fromEntries(reopened.nodes.map((n) => [n.occurrence, { ...n.rect }])),
    ).toEqual(Object.fromEntries(unfolded.nodes.map((n) => [n.occurrence, { ...n.rect }])));
    expect(reopened.edges).toEqual(unfolded.edges);
    expect(reopened.linkLegend).toEqual(unfolded.linkLegend);
  });

  it("should shrink the painted bounds on inner fold and restore them on unfold", () => {
    const f = projectedChainFixture();
    const unfolded = layoutAndSceneOf([]).scene;
    const folded = layoutAndSceneOf([f.foldOccurrence]).scene;
    expect(folded.bounds).toBeDefined();
    expect(unfolded.bounds).toBeDefined();
    expect(folded.bounds!.height).toBeLessThan(unfolded.bounds!.height);

    const again = layoutAndSceneOf([]).scene;
    expect(again.bounds).toEqual(unfolded.bounds);
    expect(
      Object.fromEntries(again.nodes.map((n) => [n.occurrence, { ...n.rect }])),
    ).toEqual(Object.fromEntries(unfolded.nodes.map((n) => [n.occurrence, { ...n.rect }])));
    expect(again.edges).toEqual(unfolded.edges);
  });

  it("should restamp depth surfaces and the legend across fold/unfold", () => {
    const f = projectedChainFixture();
    const unfolded = layoutAndSceneOf([]).scene;
    const folded = layoutAndSceneOf([f.foldOccurrence]).scene;
    expect(
      "depth" in (unfolded.nodes.find((n) => n.occurrence === f.outerFoldOccurrence)!.presentation as object),
    ).toBe(false);
    expect(
      "depth" in (folded.nodes.find((n) => n.occurrence === f.outerFoldOccurrence)!.presentation as object),
    ).toBe(false);
    expect(folded.nodes.find((n) => n.occurrence === f.foldOccurrence)!.presentation?.depth).toBe(1);
    expect(folded.bounds!.width).toBeGreaterThan(0);
    expect(folded.bounds!.height).toBeGreaterThan(0);

    expect(unfolded.linkLegend).toBeDefined();
    expect(unfolded.linkLegend!.entries).toHaveLength(3);
    expect(folded.linkLegend).toBeUndefined();
  });

  it("should enforce zero route-spacing conflicts and valid views across every fold state", () => {
    const f = projectedChainFixture();
    const states: readonly (readonly SceneOccurrenceRef[])[] = [
      [],
      [f.foldOccurrence],
      [f.outerFoldOccurrence],
      [f.outerFoldOccurrence, f.foldOccurrence],
    ];
    for (const collapsed of states) {
      const { laid, scene } = layoutAndSceneOf(collapsed);
      expect(laid.routeSpacing, `routeSpacing for [${collapsed.join(", ")}]`).toBeDefined();
      expect(
        laid.routeSpacing!.conflictCount,
        `conflicts for [${collapsed.join(", ")}]: ${JSON.stringify(laid.routeSpacing!.conflicts)}`,
      ).toBe(0);
      const viewDiagnostics = validateView(laid.view, f.document, {
        registry: f.registry,
        bindings: f.bindings,
      });
      expect(viewDiagnostics, `validateView for [${collapsed.join(", ")}]`).toEqual([]);
      for (const edge of scene.edges) {
        expect(edge.points.length).toBeGreaterThan(1);
      }
    }
  });
});
