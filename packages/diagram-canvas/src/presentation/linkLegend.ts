/**
 * Automatic link-style legend for `SceneModel` (DE-2, OWNER-ADDENDA ask 4).
 *
 * Inspects the visible connector styles actually drawn in the current fold
 * state, orders them in a fixed canonical order, and places a self-contained
 * legend strip anchored on an edge (right by default) outside the flow of
 * functional zones. Suppressed automatically when fewer than two distinct
 * connector styles are visible, or when `anchor === "none"`.
 *
 * Pure geometry and presentation data: zero DOM, zero framework dependencies.
 */
import type {
  CanonicalArrowheadKind,
  LinkEmphasis,
  StrokeStyle,
} from "@sentropic/diagram-core";

import {
  DEFAULT_EDGE_LABEL_SIZE,
  DEFAULT_LINK_EMPHASIS_STROKE_WIDTH,
  DEFAULT_LINK_STROKE_WIDTH,
} from "../camera.js";
import type { LineMeasurer } from "../layout/measure.js";
import type { Rect } from "../transform.js";
import { connectorDashArray, connectorMarkerKind } from "./connectorStyle.js";

/** Where the automatic link-style legend strip sits relative to the functional drawing. */
export type LinkLegendAnchor = "right" | "bottom" | "none";

/** Canonical sort orders over the three closed connector registry axes. */
export const LINK_LEGEND_STROKE_ORDER: readonly StrokeStyle[] = Object.freeze([
  "solid",
  "dashed",
  "dotted",
]);

export const LINK_LEGEND_EMPHASIS_ORDER: readonly LinkEmphasis[] = Object.freeze([
  "default",
  "emphasis",
]);

export const LINK_LEGEND_ARROWHEAD_ORDER: readonly CanonicalArrowheadKind[] = Object.freeze([
  "arrow",
  "none",
]);

/** World-unit geometry constants shared by SVG, Svelte and Vue renderers. */
export const LINK_LEGEND_GAP = 48;
export const LINK_LEGEND_PADDING = 16;
export const LINK_LEGEND_HEADER_HEIGHT = 30;
export const LINK_LEGEND_SWATCH_WIDTH = 56;
export const LINK_LEGEND_SWATCH_GAP = 14;
export const LINK_LEGEND_ROW_HEIGHT = 28;
export const LINK_LEGEND_ROW_GAP = 8;
export const LINK_LEGEND_MIN_WIDTH = 240;
export const LINK_LEGEND_FONT_SIZE = DEFAULT_EDGE_LABEL_SIZE;

export interface LinkLegendEdgeInput {
  readonly markers?: string;
  readonly directed?: boolean;
  readonly strokeStyle?: StrokeStyle;
  readonly arrowhead?: "arrow" | CanonicalArrowheadKind;
  readonly emphasis?: LinkEmphasis;
}

export interface LinkLegendStyleKey {
  readonly strokeStyle: StrokeStyle;
  readonly arrowhead: CanonicalArrowheadKind;
  readonly emphasis: LinkEmphasis;
}

export interface LinkLegendEntry extends LinkLegendStyleKey {
  /** Deterministic key: `<strokeStyle>:<arrowhead>:<emphasis>`. */
  readonly key: string;
  /** Human-readable label shown beside the sample swatch. */
  readonly label: string;
  /** Count of visible connectors using this style in the current fold state. */
  readonly count: number;
  /** Top offset of this row inside the legend box (world units). */
  readonly rowY: number;
  /** Height of this row inside the legend box (world units). */
  readonly rowHeight: number;
}

export interface SceneLinkLegend {
  readonly anchor: Exclude<LinkLegendAnchor, "none">;
  readonly title: string;
  /** Outer bounding rectangle in world coordinates, outside the functional flow. */
  readonly rect: Rect;
  /** Visible styles in fixed canonical order (always length >= 2). */
  readonly entries: readonly LinkLegendEntry[];
  readonly padding: number;
  readonly headerHeight: number;
  readonly swatchWidth: number;
  readonly swatchGap: number;
  readonly fontSize: number;
}

export interface LinkLegendSwatchGeometry {
  readonly viewBox: string;
  readonly width: number;
  readonly height: number;
  readonly linePath: string;
  readonly arrowPath?: string;
  readonly stroke: string;
  readonly strokeWidth: number;
  readonly dashArray?: string;
  readonly arrowFill?: string;
  readonly arrowStroke?: string;
  readonly arrowStrokeWidth?: number;
}

const EDGE_STROKE = "var(--st-component-diagramScene-edgeStroke, #64748b)";
const EMPHASIS_STROKE = "var(--st-component-diagramScene-linkEmphasisStroke, #2563eb)";

/** Stable canonical key for a connector style triple. */
export function linkStyleKey(style: LinkLegendStyleKey): string {
  return `${style.strokeStyle}:${style.arrowhead}:${style.emphasis}`;
}

/** Default human-readable label derived strictly from the closed registry words. */
export function defaultLinkStyleLabel(style: LinkLegendStyleKey): string {
  const parts: string[] = [];
  if (style.emphasis === "emphasis") parts.push("Emphasis");
  if (style.strokeStyle === "dashed") {
    parts.push("Proposed (dashed)");
  } else if (style.strokeStyle === "dotted") {
    parts.push("Dotted");
  } else if (parts.length === 0) {
    parts.push("Link");
  }
  if (style.arrowhead === "none") {
    parts.push("Undirected");
  }
  return parts.join(" · ");
}

function styleRank(style: LinkLegendStyleKey): number {
  const stroke = LINK_LEGEND_STROKE_ORDER.indexOf(style.strokeStyle);
  const emphasis = LINK_LEGEND_EMPHASIS_ORDER.indexOf(style.emphasis);
  const arrowhead = LINK_LEGEND_ARROWHEAD_ORDER.indexOf(style.arrowhead);
  return stroke * 4 + emphasis * 2 + arrowhead;
}

/**
 * Collect distinct visible connector styles in fixed canonical order.
 * Returns an empty list when fewer than two distinct styles are drawn
 * (single-style and edgeless scenes omit the legend).
 */
export function collectLinkLegendStyles(
  edges: readonly LinkLegendEdgeInput[],
): readonly (LinkLegendStyleKey & { readonly key: string; readonly count: number })[] {
  const counts = new Map<string, LinkLegendStyleKey & { count: number }>();
  for (const edge of edges) {
    if (edge.markers !== undefined || edge.directed === true) continue;
    const strokeStyle: StrokeStyle = edge.strokeStyle ?? "solid";
    const arrowhead: CanonicalArrowheadKind = connectorMarkerKind(edge.arrowhead);
    const emphasis: LinkEmphasis = edge.emphasis === "emphasis" ? "emphasis" : "default";
    const triple: LinkLegendStyleKey = { strokeStyle, arrowhead, emphasis };
    const key = linkStyleKey(triple);
    const existing = counts.get(key);
    if (existing !== undefined) {
      existing.count += 1;
    } else {
      counts.set(key, { ...triple, count: 1 });
    }
  }
  if (counts.size < 2) return [];
  return [...counts.entries()]
    .map(([key, value]) => ({
      key,
      strokeStyle: value.strokeStyle,
      arrowhead: value.arrowhead,
      emphasis: value.emphasis,
      count: value.count,
    }))
    .sort((left, right) => styleRank(left) - styleRank(right));
}

export interface BuildSceneLinkLegendInput {
  readonly edges: readonly LinkLegendEdgeInput[];
  readonly contentBounds: Rect | undefined;
  readonly measureLines: LineMeasurer;
  /** Anchor edge strip (`"right"` by default). `"none"` suppresses the legend. */
  readonly anchor?: LinkLegendAnchor;
  /** Legend heading text (defaults to `"Legend"`). */
  readonly title?: string;
  /** Optional custom labels keyed by `linkStyleKey(...)`. */
  readonly labels?: Readonly<Record<string, string>>;
  /** Optional world-unit font size override (defaults to `edgeLabelSize`, 18). */
  readonly fontSize?: number;
}

/**
 * Compute the automatic link-style legend and its anchored world rectangle
 * outside `contentBounds`. Returns `undefined` when suppressed or when fewer
 * than two distinct styles are drawn.
 */
export function buildSceneLinkLegend(input: BuildSceneLinkLegendInput): SceneLinkLegend | undefined {
  const anchor = input.anchor ?? "right";
  if (anchor === "none" || input.contentBounds === undefined) return undefined;
  const collected = collectLinkLegendStyles(input.edges);
  if (collected.length < 2) return undefined;

  const title = input.title ?? "Legend";
  const fontSize = input.fontSize ?? LINK_LEGEND_FONT_SIZE;
  const scale = fontSize > 0 && Number.isFinite(fontSize) ? fontSize / LINK_LEGEND_FONT_SIZE : 1;
  const headerHeight = scale === 1 ? LINK_LEGEND_HEADER_HEIGHT : Math.ceil(LINK_LEGEND_HEADER_HEIGHT * scale);
  const rowHeight = scale === 1 ? LINK_LEGEND_ROW_HEIGHT : Math.ceil(LINK_LEGEND_ROW_HEIGHT * scale);
  const rowGap = scale === 1 ? LINK_LEGEND_ROW_GAP : Math.ceil(LINK_LEGEND_ROW_GAP * scale);
  const titleLayout = input.measureLines({
    text: title,
    role: "edge-label",
    availableWidth: Number.MAX_SAFE_INTEGER,
    allocatedLines: 1,
    folded: false,
  });
  const scaledTitleWidth = titleLayout.width * scale;

  let maxLabelWidth = 0;
  const entries: LinkLegendEntry[] = collected.map((item, index) => {
    const label = input.labels?.[item.key] ?? defaultLinkStyleLabel(item);
    const measured = input.measureLines({
      text: label,
      role: "edge-label",
      availableWidth: Number.MAX_SAFE_INTEGER,
      allocatedLines: 1,
      folded: false,
    });
    const scaledWidth = measured.width * scale;
    if (scaledWidth > maxLabelWidth) maxLabelWidth = scaledWidth;
    const rowY =
      LINK_LEGEND_PADDING +
      headerHeight +
      index * (rowHeight + rowGap);
    return {
      ...item,
      label,
      rowY,
      rowHeight,
    };
  });

  const contentWidth = Math.max(
    scaledTitleWidth,
    LINK_LEGEND_SWATCH_WIDTH + LINK_LEGEND_SWATCH_GAP + maxLabelWidth,
  );
  const width = Math.ceil(Math.max(LINK_LEGEND_MIN_WIDTH, 2 * LINK_LEGEND_PADDING + contentWidth));
  const height =
    2 * LINK_LEGEND_PADDING +
    headerHeight +
    entries.length * rowHeight +
    Math.max(0, entries.length - 1) * rowGap;

  const rect: Rect =
    anchor === "bottom"
      ? {
          x: input.contentBounds.x,
          y: input.contentBounds.y + input.contentBounds.height + LINK_LEGEND_GAP,
          width,
          height,
        }
      : {
          x: input.contentBounds.x + input.contentBounds.width + LINK_LEGEND_GAP,
          y: input.contentBounds.y,
          width,
          height,
        };

  return {
    anchor,
    title,
    rect,
    entries,
    padding: LINK_LEGEND_PADDING,
    headerHeight,
    swatchWidth: LINK_LEGEND_SWATCH_WIDTH,
    swatchGap: LINK_LEGEND_SWATCH_GAP,
    fontSize,
  };
}

/**
 * Inline SVG swatch geometry for a legend entry. Draws the sample line and
 * arrowhead directly without `<marker>` ids so SVG, Svelte and Vue stay
 * id-collision-free and DOM-identical.
 */
export function linkLegendSwatchGeometry(
  style: LinkLegendStyleKey,
  widths?: { readonly linkStrokeWidth?: number; readonly linkEmphasisStrokeWidth?: number },
): LinkLegendSwatchGeometry {
  const emphasized = style.emphasis === "emphasis";
  const stroke = emphasized ? EMPHASIS_STROKE : EDGE_STROKE;
  const strokeWidth = emphasized
    ? (widths?.linkEmphasisStrokeWidth ?? DEFAULT_LINK_EMPHASIS_STROKE_WIDTH)
    : (widths?.linkStrokeWidth ?? DEFAULT_LINK_STROKE_WIDTH);
  const dashArray = connectorDashArray(style.strokeStyle);
  const lineEnd = style.arrowhead === "none" ? 54 : 46;
  const linePath = `M2 8H${lineEnd}`;

  if (style.arrowhead === "none") {
    return {
      viewBox: `0 0 ${LINK_LEGEND_SWATCH_WIDTH} 16`,
      width: LINK_LEGEND_SWATCH_WIDTH,
      height: 16,
      linePath,
      stroke,
      strokeWidth,
      ...(dashArray === undefined ? {} : { dashArray }),
    };
  }
  return {
    viewBox: `0 0 ${LINK_LEGEND_SWATCH_WIDTH} 16`,
    width: LINK_LEGEND_SWATCH_WIDTH,
    height: 16,
    linePath,
    arrowPath: "M44 3L54 8L44 13Z",
    stroke,
    strokeWidth,
    ...(dashArray === undefined ? {} : { dashArray }),
    arrowFill: stroke,
  };
}
