import { describe, expect, it } from "vitest";
import { layoutMeasured } from "../../src/layout/measured.js";
import {
  layoutScene,
  resolveScene,
  type SceneLaidOut,
  type SceneLayoutInput,
} from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";
import { projectedChainFixture } from "../../test-support/projectedChainFixture.js";

/**
 * E1 three-target parity (REQ-R7-19): one projected fixture yields one
 * SceneModel, rendered identically by the direct `layoutMeasured` chain,
 * the shared `layoutScene` seam the Svelte and Vue hosts call, and the
 * `renderSceneSvg` serialisation. Geometry is compared exactly; the same
 * measurer and the same code path must produce the same numbers.
 */
function inputOf(): SceneLayoutInput {
  const f = projectedChainFixture();
  return {
    document: f.document,
    presentation: f.presentation,
    registry: f.registry,
    bindings: f.bindings,
    measureLines: f.measureLines,
    collapsed: [],
    hints: { ordering: f.ordering, rootOrder: f.rootOrder },
    targetWidth: 1440,
  };
}

/** The direct chain: `layoutMeasured` (`@1`) -> `resolveScene`. */
function directScene(input: SceneLayoutInput) {
  const laid = layoutMeasured(input.document, {
    registry: input.registry,
    ...(input.bindings === undefined ? {} : { bindings: input.bindings }),
    measureText: (text) => {
      const layout = input.measureLines({
        text,
        role: "body",
        availableWidth: Number.MAX_SAFE_INTEGER,
        allocatedLines: 1,
        folded: false,
      });
      return { width: layout.width, height: layout.height };
    },
    presentation: input.presentation,
    measureLines: input.measureLines,
    collapsed: input.collapsed,
    ...(input.hints === undefined ? {} : { hints: input.hints }),
    ...(input.metrics === undefined ? {} : { metrics: input.metrics }),
    ...(input.rowPack === undefined ? {} : { rowPack: input.rowPack }),
    targetWidth: input.targetWidth ?? 1440,
    ...(input.previousOrientation === undefined ? {} : { previousOrientation: input.previousOrientation }),
  });
  if (laid.status !== "laid-out") throw new Error("direct refused: " + JSON.stringify(laid.refusals));
  return { laid: laid as SceneLaidOut, scene: resolveScene(laid, input) };
}

/** Node rects as `occurrence -> rect` for a geometry diff. */
function rectsOf(scene: ReturnType<typeof directScene>["scene"]) {
  return Object.fromEntries(scene.nodes.map((n) => [n.occurrence, { ...n.rect }]));
}

/** Edge routes as `occurrence -> points` for a route diff. */
function routesOf(scene: ReturnType<typeof directScene>["scene"]) {
  return Object.fromEntries(scene.edges.map((e) => [e.occurrence, [...e.points]]));
}

describe("projected model chain E1 parity", () => {
  it("should render one SceneModel with identical geometry on all three targets", () => {
    const input = inputOf();

    // Target 1: the direct documented chain.
    const direct = directScene(input);

    // Target 2: the shared seam both hosts call (`layoutScene` + `resolveScene`).
    const shared = layoutScene(input);
    if (shared.status !== "laid-out") throw new Error("shared refused: " + JSON.stringify(shared.refusals));
    const sharedScene = resolveScene(shared, input);

    // Target 3: the SVG serialisation runs the same pair.
    const { result: svgResult, scene: svgScene, svg } = renderSceneSvg(input);

    // Same model, same bounds, same geometry.
    expect(rectsOf(sharedScene)).toEqual(rectsOf(direct.scene));
    expect(rectsOf(svgScene)).toEqual(rectsOf(direct.scene));
    expect(routesOf(sharedScene)).toEqual(routesOf(direct.scene));
    expect(routesOf(svgScene)).toEqual(routesOf(direct.scene));
    expect(svgResult.status).toBe("laid-out");
    expect(svgScene.bounds).toEqual(direct.scene.bounds);
    expect(sharedScene.bounds).toEqual(direct.scene.bounds);

    // The serialised SVG carries the same occurrences and the same routes.
    for (const node of direct.scene.nodes) {
      expect(svg, node.occurrence).toContain(`data-scene-occurrence="${node.occurrence}"`);
      expect(svg, node.occurrence).toContain(`translate(${node.rect.x} ${node.rect.y})`);
    }
    for (const edge of direct.scene.edges) {
      expect(svg, edge.occurrence).toContain(`data-scene-edge="${edge.occurrence}"`);
    }
  });

  it("should keep compact ancestry, depth surfaces and icon-none semantics on the model", () => {
    const input = inputOf();
    const { scene } = directScene(input);
    const byOccurrence: Map<string, (typeof scene.nodes)[number]> = new Map(
      scene.nodes.map((n) => [String(n.occurrence), n] as const),
    );

    // Compact cards: `v2` pinned anatomy everywhere.
    for (const node of scene.nodes) {
      expect(node.presentation?.anatomy, String(node.occurrence)).toBe("v2");
      expect(node.presentation?.icon, String(node.occurrence)).toBe("none");
    }

    // Depth surfaces: two levels stamped with alternating parity (lean
    // stamps: the top level needs no key, absent means `0`).
    const outer = byOccurrence.get("occurrence:e.project")!;
    const inner = byOccurrence.get("occurrence:e.workstream")!;
    expect(outer.kind).toBe("zone");
    expect(inner.kind).toBe("zone");
    expect("depth" in (outer.presentation as object), "outer depth").toBe(false);
    expect(inner.presentation?.depth, "inner depth").toBe(1);
  });

  it("should carry the DE-2 link words and the automatic right legend", () => {
    const { scene } = directScene(inputOf());
    const styles: Map<string, (typeof scene.edges)[number]> = new Map(
      scene.edges.map((e) => [String(e.occurrence), e] as const),
    );
    // Closed-word defaults are omitted from the model (`solid` /
    // `filled-triangle` / `default` are the resolved defaults), so the
    // legend keys are the exact proof of the three presentation words.
    expect(styles.get("occurrence:r.lnk-feed")?.strokeStyle).toBeUndefined();
    expect(styles.get("occurrence:r.lnk-drive")).toMatchObject({
      strokeStyle: "dashed",
      emphasis: "emphasis",
    });
    expect(styles.get("occurrence:r.lnk-handoff")).toMatchObject({
      strokeStyle: "dotted",
      arrowhead: "open-triangle",
    });

    expect(scene.linkLegend).toBeDefined();
    expect(scene.linkLegend!.anchor).toBe("right");
    expect(scene.linkLegend!.entries.map((e) => e.key)).toEqual([
      "solid:filled-triangle:default",
      "dashed:filled-triangle:emphasis",
      "dotted:open-triangle:default",
    ]);
    expect(scene.bounds).toBeDefined();
  });

  it("should lay out deterministically: repeated direct and shared passes agree exactly", () => {
    const input = inputOf();
    const first = directScene(input);
    const second = directScene(input);
    expect(rectsOf(second.scene)).toEqual(rectsOf(first.scene));
    expect(routesOf(second.scene)).toEqual(routesOf(first.scene));
    const shared = layoutScene(input);
    if (shared.status !== "laid-out") throw new Error("shared refused");
    const sharedSecond = layoutScene(input);
    if (sharedSecond.status !== "laid-out") throw new Error("shared refused");
    expect(resolveScene(sharedSecond, input).bounds).toEqual(resolveScene(shared, input).bounds);
  });
});
