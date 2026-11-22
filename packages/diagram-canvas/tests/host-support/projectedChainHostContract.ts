/**
 * Shared Node/jsdom contract for E1 three-target parity and live fold/unfold
 * across Svelte `DiagramSceneFigure`, Vue `DiagramSceneFigure` (classic and
 * Vapor), and `renderSceneSvg` (`@sentropic/diagram-canvas/diagram-render`).
 *
 * Every target renders the exact same `projectedChainFixture` at the exact
 * same viewport basis (`1440 x 900`), and every rendered node rect, compact
 * `352 x 154` card/collapsed-zone footprint, `icon: "none"` omission,
 * alternating depth surface (`surface1`/`surface2`), DE-2 `<path d>` /
 * dash / arrowhead / emphasis paint, edge label box, and `[data-scene-legend]`
 * geometry is compared directly across all three targets and against the
 * engine `SceneModel` within `1/64 px` (REQ-R7-19, REQ-R7-05).
 */
import { expect } from "vitest";
import { fireEvent } from "@testing-library/dom";
import { renderSceneSvg } from "@sentropic/diagram-canvas/diagram-render";
import {
  connectorDashArray,
  connectorDashPaint,
  connectorPath,
  DEFAULT_EDGE_CORNER_RADIUS,
  type DiagramSceneFigureProps,
  type SceneLayoutInput,
  type SceneModel,
  type SceneOccurrenceRef,
} from "@sentropic/diagram-canvas/diagramSceneModel";
import {
  PROJECTED_CHAIN_TARGET_WIDTH,
  PROJECTED_CHAIN_WINDOW_HEIGHT,
  projectedChainFixture,
} from "../../test-support/projectedChainFixture.js";

const COMPACT_CARD_WIDTH = 352;
const COMPACT_CARD_HEIGHT = 154;
const ENGINE_TOLERANCE_PX = 1 / 64;

export interface ProjectedHostView {
  readonly container: HTMLElement;
}
export type ProjectedHostMount = (props: DiagramSceneFigureProps) => ProjectedHostView;

export interface ProjectedNodeSnapshot {
  readonly occurrence: string;
  readonly kind: "card" | "zone";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly collapsed: boolean;
  readonly hasIcon: boolean;
  readonly surface: "default" | "surface1" | "surface2";
}

export interface ProjectedEdgeSnapshot {
  readonly occurrence: string;
  readonly mode: string | null;
  readonly d: string;
  readonly stroke: string | null;
  readonly dasharray: string | null;
  readonly dashPaint: string | null;
  readonly arrowhead: string | null;
  readonly emphasis: string | null;
  readonly markerKind: "none" | "default" | "emphasis";
}

export interface ProjectedLabelSnapshot {
  readonly occurrence: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly text: string;
}

export interface ProjectedLegendEntrySnapshot {
  readonly key: string;
  readonly stroke: string | null;
  readonly arrowhead: string | null;
  readonly emphasis: string | null;
  readonly swatchD: string | null;
  readonly swatchDash: string | null;
  readonly hasArrow: boolean;
}

export interface ProjectedLegendSnapshot {
  readonly anchor: string | null;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly entries: readonly ProjectedLegendEntrySnapshot[];
}

export interface ProjectedTargetSnapshot {
  readonly nodes: Readonly<Record<string, ProjectedNodeSnapshot>>;
  readonly edges: Readonly<Record<string, ProjectedEdgeSnapshot>>;
  readonly labels: Readonly<Record<string, ProjectedLabelSnapshot>>;
  readonly legend: ProjectedLegendSnapshot | null;
}

export interface ProjectedFoldSnapshots {
  readonly unfolded: ProjectedTargetSnapshot;
  readonly innerFolded: ProjectedTargetSnapshot;
  readonly outerFolded: ProjectedTargetSnapshot;
}

/** Strictly typed props for Svelte/Vue/Vapor hosts — no unsafe casts. */
export function projectedChainProps(): DiagramSceneFigureProps {
  const f = projectedChainFixture();
  return {
    document: f.document,
    registry: f.registry,
    bindings: f.bindings,
    presentation: f.presentation,
    measureLines: f.measureLines,
    hints: f.hints,
    targetWidth: PROJECTED_CHAIN_TARGET_WIDTH,
  };
}

/** Matching `SceneLayoutInput` for `renderSceneSvg` at the same width basis. */
export function projectedChainLayoutInput(
  collapsed: readonly SceneOccurrenceRef[] = [],
): SceneLayoutInput {
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

function classifySurface(text: string): "default" | "surface1" | "surface2" {
  if (text.includes("--st-component-diagramZone-surface2")) return "surface2";
  if (text.includes("--st-component-diagramZone-surface1")) return "surface1";
  return "default";
}

function normalizeDashPaint(styleAttr: string | null): string | null {
  if (styleAttr === null) return null;
  const match = /stroke-dasharray\s*:\s*([^;]+)/i.exec(styleAttr);
  return match === null ? null : match[1]!.trim().replace(/\s+/g, " ");
}

function classifyMarker(
  markerEnd: string | null,
  defsScope: ParentNode,
  context: string,
): "none" | "default" | "emphasis" {
  if (markerEnd === null) return "none";
  const match = /^url\(#([^)]+)\)$/.exec(markerEnd);
  expect(match, `${context}: valid marker-end url(#id)`).not.toBeNull();
  const id = match![1]!;
  const marker = defsScope.querySelector(`defs marker[id="${id}"]`);
  expect(marker, `${context}: referenced <marker id="${id}"> exists in <defs>`).not.toBeNull();
  if (marker!.getAttribute("data-arrowhead-emphasis") === "emphasis") {
    expect(marker!.getAttribute("data-arrowhead-kind"), `${context}: emphasis marker kind`).toBe("arrow");
    return "emphasis";
  }
  return "default";
}

function parseTranslate(transform: string | null, context: string): { x: number; y: number } {
  const match = /^translate\(([-\d.e+]+)[,\s]+([-\d.e+]+)\)$/.exec((transform ?? "").trim());
  expect(match, `${context}: translate(x y) transform`).not.toBeNull();
  return { x: Number(match![1]), y: Number(match![2]) };
}

/** Extract rendered geometry, compact v2 flags, depth surfaces, DE-2 edges and legend from a mounted HTML host. */
export function extractHostSnapshot(container: HTMLElement): ProjectedTargetSnapshot {
  const world = container.querySelector<HTMLElement>(".st-diagramSceneFigure-world");
  expect(world, "mounted scene world").not.toBeNull();
  expect(world!.querySelectorAll("polyline[data-scene-edge]"), "r7 host renders <path>, never <polyline>").toHaveLength(0);

  const nodes: Record<string, ProjectedNodeSnapshot> = {};
  for (const el of world!.querySelectorAll<HTMLElement>("[data-scene-occurrence]")) {
    const occurrence = el.dataset["sceneOccurrence"]!;
    const kind = el.dataset["sceneKind"] === "zone" ? "zone" : "card";
    const zonePos = el.querySelector<HTMLElement>(".st-diagramZone-pos");
    const collapsed = kind === "zone" && zonePos?.getAttribute("data-collapsed") === "true";
    // Every rendered card or zone on the compact v2 fixture carries the v2 modifier class.
    const boxEl = el.querySelector<HTMLElement>(".st-diagramZone, .st-diagramCard");
    expect(boxEl, `${occurrence}: rendered card or zone element`).not.toBeNull();
    expect(
      boxEl!.classList.contains("st-diagramCard--v2") || boxEl!.classList.contains("st-diagramZone--v2"),
      `${occurrence}: compact v2 class`,
    ).toBe(true);
    const surface = classifySurface(boxEl!.getAttribute("style") ?? "");
    const hasIcon = el.querySelector("[data-diagram-icon], .st-diagramCard-icon, .st-diagramZone-icon") !== null;
    nodes[occurrence] = {
      occurrence,
      kind,
      x: parseFloat(el.style.left),
      y: parseFloat(el.style.top),
      width: parseFloat(el.style.width),
      height: parseFloat(el.style.height),
      collapsed,
      hasIcon,
      surface,
    };
  }

  const edgeSvg = world!.querySelector<SVGSVGElement>("svg.st-diagramSceneFigure-edges");
  expect(edgeSvg, "mounted edge layer svg").not.toBeNull();
  const edges: Record<string, ProjectedEdgeSnapshot> = {};
  for (const edge of edgeSvg!.querySelectorAll<SVGPathElement>("path[data-scene-edge]")) {
    const occurrence = edge.getAttribute("data-scene-edge")!;
    edges[occurrence] = {
      occurrence,
      mode: edge.getAttribute("data-connector-mode"),
      d: edge.getAttribute("d") ?? "",
      stroke: edge.getAttribute("data-edge-stroke"),
      dasharray: edge.getAttribute("stroke-dasharray"),
      dashPaint: normalizeDashPaint(edge.getAttribute("style")),
      arrowhead: edge.getAttribute("data-edge-arrowhead"),
      emphasis: edge.getAttribute("data-edge-emphasis"),
      markerKind: classifyMarker(edge.getAttribute("marker-end"), edgeSvg!, `host ${occurrence}`),
    };
  }

  const labels: Record<string, ProjectedLabelSnapshot> = {};
  for (const label of world!.querySelectorAll<HTMLElement>("[data-scene-label]")) {
    const occurrence = label.getAttribute("data-scene-label")!;
    labels[occurrence] = {
      occurrence,
      x: parseFloat(label.style.left),
      y: parseFloat(label.style.top),
      width: parseFloat(label.style.width),
      height: parseFloat(label.style.height),
      text: (label.textContent ?? "").trim().replace(/\s+/g, " "),
    };
  }

  const legendEl = world!.querySelector<HTMLElement>("[data-scene-legend]");
  const legend: ProjectedLegendSnapshot | null = legendEl === null
    ? null
    : {
        anchor: legendEl.getAttribute("data-legend-anchor"),
        x: parseFloat(legendEl.style.left),
        y: parseFloat(legendEl.style.top),
        width: parseFloat(legendEl.style.width),
        height: parseFloat(legendEl.style.height),
        entries: [...legendEl.querySelectorAll<HTMLElement>("[data-legend-style]")].map((item) => {
          const swatch = item.querySelector<SVGPathElement>("path[data-legend-swatch]");
          const swatchSvg = swatch?.closest("svg");
          const swatchPaths = swatchSvg === null || swatchSvg === undefined ? [] : [...swatchSvg.querySelectorAll("path")];
          return {
            key: item.getAttribute("data-legend-style")!,
            stroke: item.getAttribute("data-edge-stroke"),
            arrowhead: item.getAttribute("data-edge-arrowhead"),
            emphasis: item.getAttribute("data-edge-emphasis"),
            swatchD: swatch?.getAttribute("d") ?? null,
            swatchDash: swatch?.getAttribute("stroke-dasharray") ?? null,
            hasArrow: swatchPaths.length > 1,
          };
        }),
      };

  return { nodes, edges, labels, legend };
}

/** Parse `renderSceneSvg` XML output into the exact same normalized snapshot shape as the HTML hosts. */
export function extractSvgSnapshot(svgMarkup: string): ProjectedTargetSnapshot {
  const doc = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
  expect(doc.querySelector("parsererror"), "renderSceneSvg produces well-formed SVG XML").toBeNull();
  const root = doc.documentElement;
  expect(root.tagName.toLowerCase()).toBe("svg");
  expect(root.querySelectorAll("polyline[data-scene-edge]"), "r7 SVG renders <path>, never <polyline>").toHaveLength(0);

  const nodes: Record<string, ProjectedNodeSnapshot> = {};
  for (const g of root.querySelectorAll("g[data-scene-occurrence]")) {
    const occurrence = g.getAttribute("data-scene-occurrence")!;
    const { x, y } = parseTranslate(g.getAttribute("transform"), `svg ${occurrence}`);
    const innerSvg = g.querySelector(":scope > svg");
    expect(innerSvg, `svg ${occurrence}: inner card/zone <svg>`).not.toBeNull();
    const zoneGroup = innerSvg!.querySelector("g.st-diagramZone");
    const kind: "card" | "zone" = zoneGroup !== null ? "zone" : "card";
    const collapsed = zoneGroup?.getAttribute("data-collapsed") === "true";
    const width = Number(innerSvg!.getAttribute("width"));
    const height = Number(innerSvg!.getAttribute("height"));
    const surfaceRect = kind === "zone" && !collapsed
      ? innerSvg!.querySelector("rect.st-diagramZone-frame")
      : innerSvg!.querySelector("rect");
    expect(surfaceRect, `svg ${occurrence}: background rect`).not.toBeNull();
    const surface = classifySurface(surfaceRect!.getAttribute("fill") ?? "");
    const hasIcon = g.querySelector("[data-diagram-icon], .st-diagramCard-icon") !== null;
    // Expanded v2 zone header with icon: "none" uses compact v2 headerInset = 12 (not v1's 16).
    if (kind === "zone" && !collapsed) {
      const kicker = innerSvg!.querySelector("text.st-diagramZone-kicker");
      expect(kicker?.getAttribute("x"), `svg ${occurrence}: v2 compact headerInset with icon: none`).toBe("12");
    }
    nodes[occurrence] = { occurrence, kind, x, y, width, height, collapsed, hasIcon, surface };
  }

  const edges: Record<string, ProjectedEdgeSnapshot> = {};
  for (const edge of root.querySelectorAll("path[data-scene-edge]")) {
    const occurrence = edge.getAttribute("data-scene-edge")!;
    edges[occurrence] = {
      occurrence,
      mode: edge.getAttribute("data-connector-mode"),
      d: edge.getAttribute("d") ?? "",
      stroke: edge.getAttribute("data-edge-stroke"),
      dasharray: edge.getAttribute("stroke-dasharray"),
      dashPaint: normalizeDashPaint(edge.getAttribute("style")),
      arrowhead: edge.getAttribute("data-edge-arrowhead"),
      emphasis: edge.getAttribute("data-edge-emphasis"),
      markerKind: classifyMarker(edge.getAttribute("marker-end"), root, `svg ${occurrence}`),
    };
  }

  const labels: Record<string, ProjectedLabelSnapshot> = {};
  for (const label of root.querySelectorAll("g[data-scene-label]")) {
    const occurrence = label.getAttribute("data-scene-label")!;
    const { x, y } = parseTranslate(label.getAttribute("transform"), `svg label ${occurrence}`);
    const rect = label.querySelector(":scope > rect");
    expect(rect, `svg label ${occurrence}: box rect`).not.toBeNull();
    const text = [...label.querySelectorAll(":scope > text")].map((t) => t.textContent ?? "").join(" ").trim();
    labels[occurrence] = {
      occurrence,
      x,
      y,
      width: Number(rect!.getAttribute("width")),
      height: Number(rect!.getAttribute("height")),
      text,
    };
  }

  const legendG = root.querySelector("g[data-scene-legend]");
  const legend: ProjectedLegendSnapshot | null = legendG === null
    ? null
    : (() => {
        const { x, y } = parseTranslate(legendG.getAttribute("transform"), "svg legend");
        const rect = legendG.querySelector(":scope > rect");
        expect(rect, "svg legend rect").not.toBeNull();
        return {
          anchor: legendG.getAttribute("data-legend-anchor"),
          x,
          y,
          width: Number(rect!.getAttribute("width")),
          height: Number(rect!.getAttribute("height")),
          entries: [...legendG.querySelectorAll("g[data-legend-style]")].map((entry) => {
            const swatch = entry.querySelector("path[data-legend-swatch]");
            const swatchGroup = swatch?.parentElement;
            const swatchPaths = swatchGroup === null || swatchGroup === undefined ? [] : [...swatchGroup.querySelectorAll("path")];
            return {
              key: entry.getAttribute("data-legend-style")!,
              stroke: entry.getAttribute("data-edge-stroke"),
              arrowhead: entry.getAttribute("data-edge-arrowhead"),
              emphasis: entry.getAttribute("data-edge-emphasis"),
              swatchD: swatch?.getAttribute("d") ?? null,
              swatchDash: swatch?.getAttribute("stroke-dasharray") ?? null,
              hasArrow: swatchPaths.length > 1,
            };
          }),
        };
      })();

  return { nodes, edges, labels, legend };
}

/** Verify a rendered snapshot agrees with the engine `SceneModel` within `1/64 px` and upholds compact v2 / depth / icon-none / DE-2 invariants. */
export function expectSnapshotMatchesEngine(
  snapshot: ProjectedTargetSnapshot,
  scene: SceneModel,
  label: string,
): void {
  expect(Object.keys(snapshot.nodes).sort(), `${label}: node occurrences`).toEqual(
    scene.nodes.map((n) => String(n.occurrence)).sort(),
  );
  for (const node of scene.nodes) {
    const actual = snapshot.nodes[String(node.occurrence)]!;
    expect(actual.kind, `${label} ${node.occurrence} kind`).toBe(node.kind);
    expect(actual.collapsed, `${label} ${node.occurrence} collapsed`).toBe(node.collapsed);
    expect(Math.abs(actual.x - node.rect.x), `${label} ${node.occurrence} x`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(Math.abs(actual.y - node.rect.y), `${label} ${node.occurrence} y`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(Math.abs(actual.width - node.rect.width), `${label} ${node.occurrence} width`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(Math.abs(actual.height - node.rect.height), `${label} ${node.occurrence} height`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    // Compact v2 footprint: every leaf card and every collapsed zone is 352 x 154.
    if (node.kind === "card" || node.collapsed) {
      expect([actual.width, actual.height], `${label} ${node.occurrence} compact 352x154`).toEqual([
        COMPACT_CARD_WIDTH,
        COMPACT_CARD_HEIGHT,
      ]);
    }
    // `icon: "none"` renders no icon glyph anywhere.
    expect(actual.hasIcon, `${label} ${node.occurrence} icon: none`).toBe(false);
    // Alternating depth surfaces: top-level `project` keeps resting surface; depth-1 `workstream` paints `surface2` both expanded and collapsed.
    if (node.occurrence === "occurrence:e.workstream") {
      expect(actual.surface, `${label} workstream depth-1 surface2`).toBe("surface2");
    } else if (node.occurrence === "occurrence:e.project") {
      expect(actual.surface, `${label} project depth-0 surface`).toBe("default");
    }
  }

  expect(Object.keys(snapshot.edges).sort(), `${label}: edge occurrences`).toEqual(
    scene.edges.map((e) => String(e.occurrence)).sort(),
  );
  for (const edge of scene.edges) {
    const actual = snapshot.edges[String(edge.occurrence)]!;
    expect(actual.mode, `${label} ${edge.occurrence} r7 mode`).toBe("r7");
    expect(actual.d, `${label} ${edge.occurrence} path d`).toBe(
      connectorPath(edge.points, DEFAULT_EDGE_CORNER_RADIUS),
    );
    expect(actual.stroke, `${label} ${edge.occurrence} stroke`).toBe(edge.strokeStyle ?? null);
    expect(actual.dasharray, `${label} ${edge.occurrence} dasharray`).toBe(connectorDashArray(edge.strokeStyle) ?? null);
    expect(actual.dashPaint, `${label} ${edge.occurrence} dashPaint`).toBe(
      normalizeDashPaint(connectorDashPaint(edge.strokeStyle) ?? null),
    );
    expect(actual.arrowhead, `${label} ${edge.occurrence} arrowhead`).toBe(edge.arrowhead ?? null);
    expect(actual.emphasis, `${label} ${edge.occurrence} emphasis`).toBe(edge.emphasis ?? null);
    const expectedMarker = edge.arrowhead === "none" ? "none" : edge.emphasis === "emphasis" ? "emphasis" : "default";
    expect(actual.markerKind, `${label} ${edge.occurrence} marker`).toBe(expectedMarker);
  }

  expect(Object.keys(snapshot.labels).sort(), `${label}: label occurrences`).toEqual(
    scene.labels.map((l) => String(l.occurrence)).sort(),
  );
  for (const edgeLabel of scene.labels) {
    const actual = snapshot.labels[String(edgeLabel.occurrence)]!;
    expect(Math.abs(actual.x - edgeLabel.box.x), `${label} label ${edgeLabel.occurrence} x`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(Math.abs(actual.y - edgeLabel.box.y), `${label} label ${edgeLabel.occurrence} y`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(Math.abs(actual.width - edgeLabel.box.width), `${label} label ${edgeLabel.occurrence} width`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(Math.abs(actual.height - edgeLabel.box.height), `${label} label ${edgeLabel.occurrence} height`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
  }

  if (scene.linkLegend === undefined) {
    expect(snapshot.legend, `${label}: no legend`).toBeNull();
  } else {
    expect(snapshot.legend, `${label}: legend rendered`).not.toBeNull();
    expect(snapshot.legend!.anchor, `${label}: legend anchor`).toBe(scene.linkLegend.anchor);
    expect(Math.abs(snapshot.legend!.x - scene.linkLegend.rect.x), `${label}: legend x`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(Math.abs(snapshot.legend!.y - scene.linkLegend.rect.y), `${label}: legend y`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(Math.abs(snapshot.legend!.width - scene.linkLegend.rect.width), `${label}: legend width`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(Math.abs(snapshot.legend!.height - scene.linkLegend.rect.height), `${label}: legend height`).toBeLessThanOrEqual(ENGINE_TOLERANCE_PX);
    expect(snapshot.legend!.entries.map((e) => e.key), `${label}: legend entry order`).toEqual(
      scene.linkLegend.entries.map((e) => e.key),
    );
  }
}

/** Render `renderSceneSvg` from `@sentropic/diagram-canvas/diagram-render` for a fold state. */
export function renderProjectedChainSvgState(collapsed: readonly SceneOccurrenceRef[] = []) {
  const rendered = renderSceneSvg(projectedChainLayoutInput(collapsed), {
    windowHeight: PROJECTED_CHAIN_WINDOW_HEIGHT,
  });
  return {
    ...rendered,
    snapshot: extractSvgSnapshot(rendered.svg),
  };
}

/**
 * Shared live fold/unfold + `renderSceneSvg` parity contract for any mounted
 * host (Svelte, Vue classic, Vue Vapor). Exercises:
 * 1. Unfolded state: exact parity with `renderSceneSvg` & engine `SceneModel`
 *    (compact 352x154 cards, `icon: "none"`, depth surfaces, DE-2 `<path d>` /
 *    dash / arrowhead / emphasis, right-anchored 3-entry legend).
 * 2. Live inner-zone fold (`occurrence:e.workstream`): `aria-expanded`, focus
 *    retention, live relayout (shrunk outer zone, collapsed 352x154 inner zone,
 *    repositioned sibling), `<path d>` re-routing on `r.lnk-handoff`, live
 *    `[data-scene-legend]` hide, depth surface preserved on collapsed inner zone,
 *    and exact parity with folded `renderSceneSvg`.
 * 3. Live inner-zone unfold: full restoration of geometry, 3 edges, `<path d>`,
 *    3-entry legend, and depth surfaces.
 * 4. Live outer-zone fold (`occurrence:e.project`): hides all 5 descendants
 *    and all 3 edges, hides legend, shrinks outer zone to collapsed 352x154,
 *    exact parity with outer-folded `renderSceneSvg`.
 * 5. Live outer-zone unfold: exact restoration of initial unfolded snapshot.
 */
export async function runProjectedChainFoldContract(
  mount: ProjectedHostMount,
  tick: () => Promise<unknown>,
  hostName: string,
): Promise<ProjectedFoldSnapshots> {
  const f = projectedChainFixture();
  const flush = async () => {
    await tick();
    await tick();
  };

  const view = mount(projectedChainProps());
  await flush();

  const toggleFor = (occurrence: string) =>
    view.container.querySelector<HTMLButtonElement>(
      `[data-scene-occurrence="${occurrence}"] button[aria-expanded]`,
    );

  // 1. Unfolded state matches `renderSceneSvg` and the engine `SceneModel`.
  const svgUnfolded = renderProjectedChainSvgState([]);
  const unfolded = extractHostSnapshot(view.container);
  expectSnapshotMatchesEngine(unfolded, svgUnfolded.scene, `${hostName} unfolded`);
  expect(unfolded, `${hostName} unfolded == renderSceneSvg`).toEqual(svgUnfolded.snapshot);
  expect(unfolded.legend?.anchor).toBe("right");
  expect(unfolded.legend?.entries.map((e) => e.key)).toEqual([
    "solid:arrow:default",
    "dashed:arrow:emphasis",
    "dotted:none:default",
  ]);
  expect(toggleFor(f.foldOccurrence)?.getAttribute("aria-expanded")).toBe("true");
  expect(toggleFor(f.outerFoldOccurrence)?.getAttribute("aria-expanded")).toBe("true");

  // 2. Fold inner zone (`occurrence:e.workstream`) live.
  await fireEvent.click(toggleFor(f.foldOccurrence)!);
  await flush();
  expect(toggleFor(f.foldOccurrence)?.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement, `${hostName}: focus retained on inner toggle after fold`).toBe(
    toggleFor(f.foldOccurrence),
  );
  for (const hidden of ["occurrence:e.parser", "occurrence:e.planner", "occurrence:e.renderer"]) {
    expect(view.container.querySelector(`[data-scene-occurrence="${hidden}"]`), `${hostName}: ${hidden} hidden`).toBeNull();
  }

  const svgInnerFolded = renderProjectedChainSvgState([f.foldOccurrence]);
  const innerFolded = extractHostSnapshot(view.container);
  expectSnapshotMatchesEngine(innerFolded, svgInnerFolded.scene, `${hostName} inner-folded`);
  expect(innerFolded, `${hostName} inner-folded == renderSceneSvg`).toEqual(svgInnerFolded.snapshot);
  // Live relayout: outer zone shrinks, inner zone collapses to 352x154 keeping surface2, sibling repositions.
  expect(innerFolded.nodes[f.outerFoldOccurrence]!.height).toBeLessThan(
    unfolded.nodes[f.outerFoldOccurrence]!.height,
  );
  expect(innerFolded.nodes[f.foldOccurrence]).toMatchObject({
    width: COMPACT_CARD_WIDTH,
    height: COMPACT_CARD_HEIGHT,
    collapsed: true,
    surface: "surface2",
  });
  expect({
    x: innerFolded.nodes["occurrence:e.handoff"]!.x,
    y: innerFolded.nodes["occurrence:e.handoff"]!.y,
  }).not.toEqual({
    x: unfolded.nodes["occurrence:e.handoff"]!.x,
    y: unfolded.nodes["occurrence:e.handoff"]!.y,
  });
  // Live link re-routing: only r.lnk-handoff remains, with recomputed `<path d>` and preserved DE-2 style.
  expect(Object.keys(innerFolded.edges)).toEqual(["occurrence:r.lnk-handoff"]);
  expect(innerFolded.edges["occurrence:r.lnk-handoff"]!.d).not.toBe(
    unfolded.edges["occurrence:r.lnk-handoff"]!.d,
  );
  expect(innerFolded.edges["occurrence:r.lnk-handoff"]).toMatchObject({
    stroke: "dotted",
    dasharray: "2 5",
    arrowhead: "none",
    markerKind: "none",
  });
  // Live legend update: single visible style hides `[data-scene-legend]`.
  expect(view.container.querySelector("[data-scene-legend]")).toBeNull();
  expect(innerFolded.legend).toBeNull();

  // 3. Unfold inner zone live: full restoration of geometry, 3 edges, `<path d>`, and 3-entry legend.
  await fireEvent.click(toggleFor(f.foldOccurrence)!);
  await flush();
  expect(toggleFor(f.foldOccurrence)?.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement, `${hostName}: focus retained on inner toggle after unfold`).toBe(
    toggleFor(f.foldOccurrence),
  );
  const afterInnerUnfold = extractHostSnapshot(view.container);
  expect(afterInnerUnfold, `${hostName}: inner unfold restores exact geometry, routes and legend`).toEqual(unfolded);

  // 4. Fold outer zone (`occurrence:e.project`) live: hides all descendants, all edges, and legend.
  await fireEvent.click(toggleFor(f.outerFoldOccurrence)!);
  await flush();
  expect(toggleFor(f.outerFoldOccurrence)?.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement, `${hostName}: focus retained on outer toggle after fold`).toBe(
    toggleFor(f.outerFoldOccurrence),
  );
  for (const hidden of [
    "occurrence:e.workstream",
    "occurrence:e.parser",
    "occurrence:e.planner",
    "occurrence:e.renderer",
    "occurrence:e.handoff",
  ]) {
    expect(view.container.querySelector(`[data-scene-occurrence="${hidden}"]`), `${hostName}: ${hidden} hidden on outer fold`).toBeNull();
  }
  const svgOuterFolded = renderProjectedChainSvgState([f.outerFoldOccurrence]);
  const outerFolded = extractHostSnapshot(view.container);
  expectSnapshotMatchesEngine(outerFolded, svgOuterFolded.scene, `${hostName} outer-folded`);
  expect(outerFolded, `${hostName} outer-folded == renderSceneSvg`).toEqual(svgOuterFolded.snapshot);
  expect(Object.keys(outerFolded.nodes)).toEqual([f.outerFoldOccurrence]);
  expect(outerFolded.nodes[f.outerFoldOccurrence]).toMatchObject({
    width: COMPACT_CARD_WIDTH,
    height: COMPACT_CARD_HEIGHT,
    collapsed: true,
    surface: "default",
  });
  expect(Object.keys(outerFolded.edges)).toEqual([]);
  expect(outerFolded.legend).toBeNull();

  // 5. Unfold outer zone live: full restoration of unfolded geometry, 3 edges, and 3-entry legend.
  await fireEvent.click(toggleFor(f.outerFoldOccurrence)!);
  await flush();
  expect(toggleFor(f.outerFoldOccurrence)?.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement, `${hostName}: focus retained on outer toggle after unfold`).toBe(
    toggleFor(f.outerFoldOccurrence),
  );
  const afterOuterUnfold = extractHostSnapshot(view.container);
  expect(afterOuterUnfold, `${hostName}: outer unfold restores exact geometry, routes and legend`).toEqual(unfolded);

  return { unfolded, innerFolded, outerFolded };
}
