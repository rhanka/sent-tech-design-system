import { describe, expect, it } from "vitest";
import {
  DS_LAYOUT_VOCABULARY,
  validateDocument,
  validateLayoutHints,
  validateView,
} from "@sentropic/diagram-core";
import { layoutMeasured } from "../../src/layout/measured.js";
import {
  connectorPath,
  DEFAULT_EDGE_CORNER_RADIUS,
  layoutScene,
  resolveScene,
  resolveScenePresentation,
  type SceneLaidOut,
  type SceneLayoutInput,
} from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/index.js";
import {
  PROJECTED_CHAIN_TARGET_WIDTH,
  PROJECTED_CHAIN_WINDOW_HEIGHT,
  projectedChainFixture,
} from "../../test-support/projectedChainFixture.js";

/**
 * E1 headless engine, schema/hints validation, and `renderSceneSvg` contract
 * (REQ-R7-19). Verifies that the projected fixture conforms to DS schemas and
 * `ds-layout-hints@1`, that the direct `resolveScenePresentation` ->
 * `layoutMeasured` -> `resolveScene` chain agrees identically with the shared
 * `layoutScene` seam and `renderSceneSvg`, and that the serialised SVG carries
 * compact `352x154` boxes, `icon: "none"`, alternating depth surfaces, DE-2
 * connector `<path d>` / dash / arrowhead / emphasis paint, and the automatic
 * right-anchored `[data-scene-legend]`.
 *
 * Full three-target DOM parity mounting the real Svelte `DiagramSceneFigure`,
 * Vue `DiagramSceneFigure` (classic and Vapor), and `renderSceneSvg` side by
 * side is pinned via `tests/host-support/projectedChainHostContract.ts` in
 * `packages/components-svelte/src/lib/DiagramSceneFigure.projectedChain.test.ts`,
 * `packages/components-vue/src/diagram-projected-chain.test.ts`, and
 * `packages/components-vue/src/vapor-runtime.test.ts`.
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
    hints: f.hints,
    targetWidth: PROJECTED_CHAIN_TARGET_WIDTH,
  };
}

/** The direct documented chain: `resolveScenePresentation` -> `layoutMeasured` (`@1`) -> `resolveScene`. */
function directScene(input: SceneLayoutInput) {
  const resolved = resolveScenePresentation(
    input.document,
    input.presentation,
    input.iconBindings,
    input.strictIcons,
    input.view,
    input.resolveGlyph,
    input.depthParityStart === undefined ? {} : { depthParityStart: input.depthParityStart },
  );
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
    presentation: resolved.presentation,
    measureLines: input.measureLines,
    collapsed: input.collapsed,
    ...(input.hints === undefined ? {} : { hints: input.hints }),
    ...(input.metrics === undefined ? {} : { metrics: input.metrics }),
    ...(input.rowPack === undefined ? {} : { rowPack: input.rowPack }),
    targetWidth: input.targetWidth ?? PROJECTED_CHAIN_TARGET_WIDTH,
    ...(input.previousOrientation === undefined ? {} : { previousOrientation: input.previousOrientation }),
  });
  if (laid.status !== "laid-out") throw new Error("direct refused: " + JSON.stringify(laid.refusals));
  return {
    laid: laid as SceneLaidOut,
    scene: resolveScene(laid, input, {
      viewWidth: input.targetWidth ?? PROJECTED_CHAIN_TARGET_WIDTH,
      windowHeight: PROJECTED_CHAIN_WINDOW_HEIGHT,
    }),
  };
}

/** Node rects as `occurrence -> rect` for a geometry diff. */
function rectsOf(scene: ReturnType<typeof directScene>["scene"]) {
  return Object.fromEntries(scene.nodes.map((n) => [n.occurrence, { ...n.rect }]));
}

/** Edge routes as `occurrence -> points` for a route diff. */
function routesOf(scene: ReturnType<typeof directScene>["scene"]) {
  return Object.fromEntries(scene.edges.map((e) => [e.occurrence, [...e.points]]));
}

describe("projected model chain E1 engine & SVG contract", () => {
  it("should validate against DS document, view and ds-layout-hints@1 schemas and refuse layered-flow on a typed view", () => {
    const f = projectedChainFixture();
    const docDiagnostics = validateDocument(f.document, {
      registry: f.registry,
      bindings: f.bindings,
    });
    expect(docDiagnostics).toEqual([]);

    const hintContext = { profiles: f.document.profileRefs, diagramPresentation: true };
    expect(validateLayoutHints(f.layoutHints, hintContext)).toEqual([]);

    // Under ds-layout-hints@1, layered-flow is refused on typed projected views (generic@1 without presentation only).
    const layeredDiagnostics = validateLayoutHints(
      { vocabulary: DS_LAYOUT_VOCABULARY, mode: "layered-flow" },
      hintContext,
    );
    expect(layeredDiagnostics.length).toBeGreaterThan(0);

    const { laid } = directScene(inputOf());
    const viewDiagnostics = validateView(laid.view, f.document, {
      registry: f.registry,
      bindings: f.bindings,
    });
    expect(viewDiagnostics).toEqual([]);
  });

  it("should produce identical SceneModel and full SVG geometry, DE-2 paint and legend across direct, layoutScene and renderSceneSvg", () => {
    const input = inputOf();

    const direct = directScene(input);

    const shared = layoutScene(input);
    if (shared.status !== "laid-out") throw new Error("shared refused: " + JSON.stringify(shared.refusals));
    const sharedScene = resolveScene(shared, input, {
      viewWidth: PROJECTED_CHAIN_TARGET_WIDTH,
      windowHeight: PROJECTED_CHAIN_WINDOW_HEIGHT,
    });

    const { result: svgResult, scene: svgScene, svg } = renderSceneSvg(input, {
      windowHeight: PROJECTED_CHAIN_WINDOW_HEIGHT,
    });

    expect(rectsOf(sharedScene)).toEqual(rectsOf(direct.scene));
    expect(rectsOf(svgScene)).toEqual(rectsOf(direct.scene));
    expect(routesOf(sharedScene)).toEqual(routesOf(direct.scene));
    expect(routesOf(svgScene)).toEqual(routesOf(direct.scene));
    expect(svgResult.status).toBe("laid-out");
    expect(svgScene.bounds).toEqual(direct.scene.bounds);
    expect(sharedScene.bounds).toEqual(direct.scene.bounds);
    expect(svgResult.routeSpacing?.conflictCount).toBe(0);

    // Serialised SVG checks: compact 352x154 cards, no icon glyph, alternating depth surface, DE-2 paths, right legend.
    expect(svg).not.toContain("<polyline");
    expect(svg).not.toContain("data-diagram-icon");
    for (const node of direct.scene.nodes) {
      expect(svg, node.occurrence).toContain(`data-scene-occurrence="${node.occurrence}"`);
      expect(svg, node.occurrence).toContain(`translate(${node.rect.x} ${node.rect.y})`);
      if (node.kind === "card") {
        expect([node.rect.width, node.rect.height], node.occurrence).toEqual([352, 154]);
        expect(svg, `${node.occurrence} compact box`).toContain(`width="352" height="154"`);
      }
    }
    expect(svg, "depth-1 inner zone uses surface2").toContain("var(--st-component-diagramZone-surface2");

    for (const edge of direct.scene.edges) {
      const expectedD = connectorPath(edge.points, DEFAULT_EDGE_CORNER_RADIUS, edge.head?.pullbackWorld ?? 0);
      expect(svg, `${edge.occurrence} id`).toContain(`data-scene-edge="${edge.occurrence}"`);
      expect(svg, `${edge.occurrence} path d`).toContain(`d="${expectedD}"`);
    }
    expect(svg, "dashed emphasis edge").toContain('stroke-dasharray="8 6"');
    expect(svg, "dotted edge").toContain('stroke-dasharray="2 5"');
    expect(svg, "emphasis head").toContain('data-connector-part="head"');
    expect(svg, "emphasis attribute").toContain('data-edge-emphasis="emphasis"');
    expect(svg, "right legend").toContain('data-scene-legend="" data-legend-anchor="right"');
    for (const key of ["solid:arrow:default", "dashed:arrow:emphasis", "dotted:none:default"]) {
      expect(svg, `legend entry ${key}`).toContain(`data-legend-style="${key}"`);
    }
  });

  it("should keep compact anatomy, depth surfaces and icon-none semantics on the model", () => {
    const input = inputOf();
    const { scene } = directScene(input);
    const byOccurrence: Map<string, (typeof scene.nodes)[number]> = new Map(
      scene.nodes.map((n) => [String(n.occurrence), n] as const),
    );

    for (const node of scene.nodes) {
      expect(node.presentation?.anatomy, String(node.occurrence)).toBe("v2");
      expect(node.presentation?.icon, String(node.occurrence)).toBe("none");
    }

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
    expect(styles.get("occurrence:r.lnk-feed")?.strokeStyle).toBeUndefined();
    expect(styles.get("occurrence:r.lnk-drive")).toMatchObject({
      strokeStyle: "dashed",
      emphasis: "emphasis",
    });
    expect(styles.get("occurrence:r.lnk-handoff")).toMatchObject({
      strokeStyle: "dotted",
      arrowhead: "none",
    });

    expect(scene.linkLegend).toBeDefined();
    expect(scene.linkLegend!.anchor).toBe("right");
    expect(scene.linkLegend!.entries.map((e) => e.key)).toEqual([
      "solid:arrow:default",
      "dashed:arrow:emphasis",
      "dotted:none:default",
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
