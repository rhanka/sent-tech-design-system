/**
 * Static draw.io (`<mxfile>`) export of one resolved scene.
 *
 * Pure-string, DOM-free. The input is the `resolveScene` output of
 * `@sentropic/diagram-canvas`; the geometry is the geometry of that single
 * view state. There is no live folding, no relayout, and no edge regrouping:
 * a folded scene exports as its folded geometry, an unfolded scene as its
 * unfolded geometry.
 */

import { connectorDashArray, connectorMarkerKind } from "@sentropic/diagram-canvas/diagram-render";
import type { SceneEdgeModel, SceneModel, SceneNodeModel } from "@sentropic/diagram-canvas/diagramSceneModel";

/** Options for {@link toDrawio}. */
export interface ToDrawioOptions {
  /**
   * Opaque metadata written verbatim into the `<mxfile>` node, alongside the
   * diagram, and readable back intact. Callers that embed a carrier payload
   * own both its format and its round-trip check.
   */
  readonly metadata?: string;
}

/** Edge stroke of a default link, mirroring the canvas fallback. */
const EDGE_STROKE = "#64748b";
/** Stroke of an emphasised link, mirroring the canvas fallback. */
const EMPHASIS_STROKE = "#2563eb";
/** Box border stroke. */
const BOX_STROKE = "#64748b";
/** Zone frame stroke. */
const ZONE_STROKE = "#94a3b8";
/** Neutral zone frame fill. */
const ZONE_FILL = "#f8fafc";

/** Fixed pastels for the category tints most scenes name; any other tint hashes into the palette. */
const TINT_PALETTE = [
  "#e3f2fd", //
  "#e8f5e9", //
  "#fff3e0", //
  "#fce4ec", //
  "#ede7f6", //
  "#e0f7fa", //
  "#fff8e1", //
  "#f5f5f5", //
] as const;

const NAMED_TINTS: Readonly<Record<string, string>> = {
  blue: "#e3f2fd",
  green: "#e8f5e9",
  teal: "#e0f7fa",
  cyan: "#e0f7fa",
  orange: "#fff3e0",
  amber: "#fff8e1",
  yellow: "#fff8e1",
  red: "#ffebee",
  pink: "#fce4ec",
  purple: "#ede7f6",
  grey: "#f5f5f5",
  gray: "#f5f5f5",
  navy: "#e8eaf6",
};

function escapeAttr(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Deterministic number formatting: the same double always renders the same bytes. */
function num(value: number): string {
  return String(value);
}

/** Fill tint for one category reference, with a stable hash fallback for unnamed tints. */
function tintFill(categoryRef: string | undefined, fallback: string): string {
  if (categoryRef === undefined || categoryRef === "") return fallback;
  const named = NAMED_TINTS[categoryRef];
  if (named !== undefined) return named;
  let hash = 0;
  for (const char of categoryRef) hash = (Math.imul(hash, 31) + char.codePointAt(0)!) | 0;
  return TINT_PALETTE[(hash & 0x7fffffff) % TINT_PALETTE.length]!;
}

/** Distance from a point to the border of a rect (0 exactly on the border). */
function borderDistance(point: { readonly x: number; readonly y: number }, rect: SceneNodeModel["rect"]): number {
  const inside =
    point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  if (inside) {
    return Math.min(point.x - rect.x, rect.x + rect.width - point.x, point.y - rect.y, rect.y + rect.height - point.y);
  }
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height));
  return Math.hypot(dx, dy);
}

/**
 * Totally-ordered name of the node a route end touches: the nearest border in
 * scene order, so the first box wins a tie. Route ends sit exactly on a dock,
 * so the winner is the box that drew them.
 */
function endpointNode(points: readonly { readonly x: number; readonly y: number }[], end: "first" | "last", nodes: readonly SceneNodeModel[]): SceneNodeModel | undefined {
  const point = end === "first" ? points[0] : points[points.length - 1];
  if (point === undefined) return undefined;
  let best: SceneNodeModel | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const node of nodes) {
    const distance = borderDistance(point, node.rect);
    if (distance < bestDistance) {
      best = node;
      bestDistance = distance;
    }
  }
  return best;
}

/** Smallest containing node of a given kind mask, or undefined at the page root. */
function parentOf(node: SceneNodeModel, nodes: readonly SceneNodeModel[]): SceneNodeModel | undefined {
  let best: SceneNodeModel | undefined;
  let bestArea = Number.POSITIVE_INFINITY;
  for (const candidate of nodes) {
    if (candidate === node || candidate.kind !== "zone" || candidate.collapsed) continue;
    const { x, y, width, height } = candidate.rect;
    const rect = node.rect;
    const contains =
      x <= rect.x && y <= rect.y && x + width >= rect.x + rect.width && y + height >= rect.y + rect.height;
    if (!contains) continue;
    const area = width * height;
    if (area < bestArea) {
      best = candidate;
      bestArea = area;
    }
  }
  return best;
}

function vertexStyle(node: SceneNodeModel): string {
  if (node.kind === "zone" && !node.collapsed) {
    return `rounded=1;whiteSpace=wrap;html=1;fillColor=${ZONE_FILL};strokeColor=${ZONE_STROKE};strokeWidth=2;`;
  }
  const fill = tintFill(node.presentation?.categoryRef, "#ffffff");
  return `rounded=1;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=${BOX_STROKE};strokeWidth=2;`;
}

function edgeStyle(edge: SceneEdgeModel): string {
  const emphasized = edge.emphasis === "emphasis";
  let style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;";
  style += `strokeColor=${emphasized ? EMPHASIS_STROKE : EDGE_STROKE};`;
  style += `strokeWidth=${emphasized ? "3.5" : "2.5"};`;
  const dash = connectorDashArray(edge.strokeStyle);
  if (dash !== undefined) style += `dashed=1;dashPattern=${dash};`;
  // Flow and ERD markers are drawn by the scene as extra geometry; like the
  // SVG renderer, those edges carry no registry arrowhead here either.
  if (edge.markers === undefined && edge.directed !== true) {
    const kind = connectorMarkerKind(edge.arrowhead);
    if (kind === "filled-triangle") style += "endArrow=classic;";
    else if (kind === "open-triangle") style += "endArrow=classic;endFill=0;";
  }
  return style;
}

/**
 * Render one `SceneModel` as a draw.io `<mxfile>` document.
 *
 * Rounded rects carry the presentation tint; expanded zones form draw.io
 * containers with their children parented inside them (child geometry is
 * relative to the container); edges keep their source and target ids and
 * their intermediate waypoints; dashes and arrowheads come from the DE-2
 * connector registry words carried by the scene edges.
 */
export function toDrawio(scene: SceneModel, options: ToDrawioOptions = {}): string {
  const nodes = scene.nodes;
  const lines: string[] = [];
  const width = scene.bounds === undefined ? 1600 : Math.ceil(scene.bounds.width) + 160;
  const height = scene.bounds === undefined ? 1200 : Math.ceil(scene.bounds.height) + 160;
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<mxfile host="app.diagrams.net" agent="diagram-codecs" version="1.0" type="device">');
  lines.push('<diagram id="diagram-1" name="Diagram 1">');
  lines.push(
    `<mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="0" page="1" pageScale="1" pageWidth="${num(width)}" pageHeight="${num(height)}" math="0" shadow="0">`,
  );
  lines.push("<root>");
  lines.push('<mxCell id="0"/>');
  lines.push('<mxCell id="1" parent="0"/>');
  for (const node of nodes) {
    const parent = parentOf(node, nodes);
    const x = parent === undefined ? node.rect.x : node.rect.x - parent.rect.x;
    const y = parent === undefined ? node.rect.y : node.rect.y - parent.rect.y;
    const parentId = parent === undefined ? "1" : escapeAttr(parent.occurrence);
    lines.push(
      `<mxCell id="${escapeAttr(node.occurrence)}" value="${escapeAttr(node.text)}" style="${escapeAttr(vertexStyle(node))}" vertex="1" parent="${parentId}">`,
    );
    lines.push(
      `<mxGeometry x="${num(x)}" y="${num(y)}" width="${num(node.rect.width)}" height="${num(node.rect.height)}" as="geometry"/>`,
    );
    lines.push("</mxCell>");
  }
  for (const edge of scene.edges) {
    const source = endpointNode(edge.points, "first", nodes);
    const target = endpointNode(edge.points, "last", nodes);
    const sourceAttr = source !== undefined ? ` source="${escapeAttr(source.occurrence)}"` : "";
    const targetAttr = target !== undefined ? ` target="${escapeAttr(target.occurrence)}"` : "";
    const waypoints = edge.points.slice(1, edge.points.length - 1);
    lines.push(
      `<mxCell id="${escapeAttr(edge.occurrence)}" value="" style="${escapeAttr(edgeStyle(edge))}" edge="1" parent="1"${sourceAttr}${targetAttr}>`,
    );
    if (waypoints.length === 0) {
      lines.push('<mxGeometry relative="1" as="geometry"/>');
    } else {
      lines.push('<mxGeometry relative="1" as="geometry">');
      lines.push('<Array as="points">');
      for (const point of waypoints) lines.push(`<mxPoint x="${num(point.x)}" y="${num(point.y)}"/>`);
      lines.push("</Array>");
      lines.push("</mxGeometry>");
    }
    lines.push("</mxCell>");
  }
  lines.push("</root>");
  lines.push("</mxGraphModel>");
  lines.push("</diagram>");
  if (options.metadata !== undefined) {
    lines.push(
      `<DiagramCodecsMetadata><![CDATA[${options.metadata.replaceAll("]]>", "]]]]><![CDATA[>")}]]></DiagramCodecsMetadata>`,
    );
  }
  lines.push("</mxfile>");
  return lines.join("\n") + "\n";
}
