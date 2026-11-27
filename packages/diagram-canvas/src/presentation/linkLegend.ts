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

import { DEFAULT_EDGE_LABEL_SIZE } from "../camera.js";
import type { LineMeasurer } from "../layout/measure.js";
import type { LayoutMetrics } from "../layout/types.js";
import type { Rect, Vec2 } from "../transform.js";
import { connectorDashArray, connectorMarkerKind, connectorStrokeWidth, LINK_EMPHASIS_STROKE, LINK_STROKE } from "./connectorStyle.js";
import { cardLineMeasurer } from "./diagramCardModel.js";

/** Supported locale codes for default legend labels. */
export type LegendLocale = "en" | "fr";

/** Entity mark kinds rendered inside the legend only when >= 2 link styles exist (DE3-L1b). */
export type LegendEntityMarkKind = "proposed" | "folded-zone";

/** Where the automatic link-style legend strip sits relative to the functional drawing. */
export type LinkLegendAnchor = "right" | "bottom" | "auto" | "none";

/** Resolved anchor emitted on `SceneLinkLegend`, including H2 `"free-cell"` and DE3-L1b `"pocket"`. */
export type SceneLinkLegendAnchor = Exclude<LinkLegendAnchor, "none" | "auto"> | "free-cell" | "pocket";

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

/** All 12 closed connector style combinations in canonical legend order. */
export const ALL_LINK_LEGEND_STYLES: readonly (LinkLegendStyleKey & { readonly key: string })[] = Object.freeze(
  LINK_LEGEND_STROKE_ORDER.flatMap((strokeStyle) =>
    LINK_LEGEND_EMPHASIS_ORDER.flatMap((emphasis) =>
      LINK_LEGEND_ARROWHEAD_ORDER.map((arrowhead) =>
        Object.freeze({
          strokeStyle,
          arrowhead,
          emphasis,
          key: `${strokeStyle}:${arrowhead}:${emphasis}`,
        }),
      ),
    ),
  ),
);

/** World-unit geometry constants shared by SVG, Svelte and Vue renderers (DE3-L1b compact anatomy). */
export const LINK_LEGEND_GAP = 48;
export const LINK_LEGEND_PADDING = 12;
export const LINK_LEGEND_HEADER_HEIGHT = 24;
export const LINK_LEGEND_HEADER_GAP = 6;
export const LINK_LEGEND_SWATCH_WIDTH = 44;
export const LINK_LEGEND_SWATCH_HEIGHT = 16;
export const LINK_LEGEND_SWATCH_GAP = 10;
export const LINK_LEGEND_ROW_HEIGHT = 24;
export const LINK_LEGEND_ROW_GAP = 6;
export const LINK_LEGEND_MIN_WIDTH = 160;
export const LINK_LEGEND_CORNER_RADIUS = 8;
export const LINK_LEGEND_POCKET_CLEARANCE = 24;
export const LINK_LEGEND_FONT_SIZE = DEFAULT_EDGE_LABEL_SIZE;

export interface LinkLegendEdgeInput {
  readonly markers?: string;
  readonly directed?: boolean;
  readonly strokeStyle?: StrokeStyle;
  readonly arrowhead?: "arrow" | CanonicalArrowheadKind;
  readonly emphasis?: LinkEmphasis;
  readonly points?: readonly Vec2[];
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

export interface LegendEntityMark {
  readonly kind: LegendEntityMarkKind;
  readonly label: string;
  readonly rowY: number;
  readonly rowHeight: number;
}

export interface AuthoredLegendKeySwatch {
  readonly fill: string;
  readonly stroke: string;
}

export interface AuthoredCombinedLegend {
  readonly entries: readonly LinkLegendEntry[];
  readonly entityMarks?: readonly LegendEntityMark[];
  readonly padding: number;
  readonly headerGap: number;
  readonly rowHeight: number;
  readonly rowGap: number;
  readonly swatchWidth: number;
  readonly swatchHeight: number;
  readonly swatchGap: number;
  readonly fontSize: number;
  readonly topOffset: number;
}

export interface SceneLinkLegend {
  readonly anchor: SceneLinkLegendAnchor;
  readonly title: string;
  /** Outer bounding rectangle in world coordinates, outside the functional flow or in an open pocket/cell. */
  readonly rect: Rect;
  /** Visible styles in fixed canonical order (always length >= 2). */
  readonly entries: readonly LinkLegendEntry[];
  /** Conditional entity marks (proposed status, folded `[+]` zone); omitted when none apply. */
  readonly entityMarks?: readonly LegendEntityMark[];
  readonly padding: number;
  readonly headerHeight: number;
  readonly headerGap: number;
  readonly rowHeight: number;
  readonly rowGap: number;
  readonly swatchWidth: number;
  readonly swatchHeight: number;
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

const EDGE_STROKE = LINK_STROKE;
const EMPHASIS_STROKE = LINK_EMPHASIS_STROKE;
const measureLegendFallback = cardLineMeasurer();

/** Stable canonical key for a connector style triple. */
export function linkStyleKey(style: LinkLegendStyleKey): string {
  return `${style.strokeStyle}:${style.arrowhead}:${style.emphasis}`;
}

/** Infer legend locale (`"fr"` or `"en"`) from an explicit override or French heading hint. */
export function inferLegendLocale(title?: string, explicitLocale?: LegendLocale): LegendLocale {
  if (explicitLocale !== undefined) return explicitLocale;
  if (title !== undefined && /\bl[ée]gende\b|\bpointill|\bpropos[ée]|\bnon orient[ée]/i.test(title)) {
    return "fr";
  }
  return "en";
}

/** Default localized legend heading (`"Legend"` / `"Légende"`). */
export function defaultLegendTitle(locale: LegendLocale = "en"): string {
  return locale === "fr" ? "Légende" : "Legend";
}

/** Default localized label for a conditional entity mark (`proposed` / `folded-zone`). */
export function defaultLegendMarkLabel(kind: LegendEntityMarkKind, locale: LegendLocale = "en"): string {
  if (kind === "proposed") return locale === "fr" ? "Proposé" : "Proposed";
  return locale === "fr" ? "Zone repliée [+]" : "Folded zone [+]";
}

/** Default human-readable label derived strictly from the closed registry words. */
export function defaultLinkStyleLabel(style: LinkLegendStyleKey, locale: LegendLocale = "en"): string {
  const parts: string[] = [];
  if (style.emphasis === "emphasis") parts.push(locale === "fr" ? "Principal" : "Emphasis");
  if (style.strokeStyle === "dashed") {
    parts.push(locale === "fr" ? "Proposé (pointillés)" : "Proposed (dashed)");
  } else if (style.strokeStyle === "dotted") {
    parts.push(locale === "fr" ? "Pointillés" : "Dotted");
  } else if (parts.length === 0) {
    parts.push(locale === "fr" ? "Lien" : "Link");
  }
  if (style.arrowhead === "none") {
    parts.push(locale === "fr" ? "Non orienté" : "Undirected");
  }
  return parts.join(" · ");
}

const KNOWN_SWATCH_TOKENS: Readonly<Record<string, [string, string]>> = {
  "accent.primary": ["--st-semantic-action-primary", "#2563eb"],
  "accent.secondary": ["--st-semantic-accent-secondary", "#7c3aed"],
  "st-accent-primary": ["--st-semantic-action-primary", "#2563eb"],
  "st-semantic-action-primary": ["--st-semantic-action-primary", "#2563eb"],
  "st-feedback-warning": ["--st-feedback-warning", "#d97706"],
  "st-feedback-positive": ["--st-feedback-positive", "#059669"],
  "st-feedback-negative": ["--st-feedback-negative", "#dc2626"],
};

const SWATCH_FALLBACK_PALETTE = [
  "#4e79a7",
  "#f28e2b",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc948",
  "#b07aa1",
] as const;

function fallbackSwatchHex(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return SWATCH_FALLBACK_PALETTE[hash % SWATCH_FALLBACK_PALETTE.length]!;
}

/**
 * Resolve a legend-key token/category pair to a CSS fill & stroke expression
 * compatible with Sentropic tokens (`st-*`) and dot-notation presentation pins.
 */
export function resolveLegendKeySwatch(token: string | undefined, category?: string): AuthoredLegendKeySwatch {
  const stroke = "var(--st-semantic-border-default, #94a3b8)";
  if (token === undefined || token.trim() === "") {
    return { fill: fallbackSwatchHex(category ?? "neutral"), stroke };
  }
  const trimmed = token.trim();
  const known = KNOWN_SWATCH_TOKENS[trimmed];
  if (known !== undefined) {
    return { fill: `var(${known[0]}, ${known[1]})`, stroke };
  }
  const cssVar = trimmed.startsWith("st-")
    ? `--${trimmed}`
    : trimmed.startsWith("semantic.")
      ? `--st-${trimmed.replaceAll(".", "-")}`
      : `--st-semantic-${trimmed.replaceAll(".", "-")}`;
  return { fill: `var(${cssVar}, ${fallbackSwatchHex(trimmed + (category ?? ""))})`, stroke };
}

function readStatusField(entry: unknown): string | undefined {
  if (entry === undefined || entry === null || typeof entry !== "object") return undefined;
  const status = (entry as { readonly status?: unknown }).status;
  return typeof status === "string" ? status : undefined;
}

/** Collect visible conditional entity marks (`proposed`, `[+]` folded zone) in canonical order. */
export function collectLegendEntityMarks(
  nodes: readonly {
    readonly occurrence?: string;
    readonly entity?: string;
    readonly kind?: string;
    readonly collapsed?: boolean;
    readonly presentation?: object | undefined;
  }[],
  presentation?: { readonly entities?: Readonly<Record<string, unknown>> },
  locale: LegendLocale = "en",
): readonly { readonly kind: LegendEntityMarkKind; readonly label: string }[] {
  let hasProposed = false;
  let hasFoldedZone = false;
  for (const node of nodes) {
    const entityEntry =
      node.occurrence !== undefined ? presentation?.entities?.[node.occurrence] : undefined;
    const status = readStatusField(node.presentation) ?? readStatusField(entityEntry);
    if (status === "proposed") hasProposed = true;
    if (node.kind === "zone" && node.collapsed === true) hasFoldedZone = true;
  }
  const marks: { readonly kind: LegendEntityMarkKind; readonly label: string }[] = [];
  if (hasProposed) marks.push({ kind: "proposed", label: defaultLegendMarkLabel("proposed", locale) });
  if (hasFoldedZone) marks.push({ kind: "folded-zone", label: defaultLegendMarkLabel("folded-zone", locale) });
  return marks;
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

export interface MeasureSceneLinkLegendInput {
  readonly edges: readonly LinkLegendEdgeInput[];
  readonly measureLines: LineMeasurer;
  /** Legend heading text (defaults to `"Legend"` or localized equivalent). */
  readonly title?: string;
  /** Optional custom labels keyed by `linkStyleKey(...)`. */
  readonly labels?: Readonly<Record<string, string>>;
  /** Optional world-unit font size override (defaults to `edgeLabelSize`, 18). */
  readonly fontSize?: number;
  /** Conditional entity marks (`proposed`, `folded-zone`) to include below link rows when >= 2 styles exist. */
  readonly entityMarks?: readonly { readonly kind: LegendEntityMarkKind; readonly label?: string }[];
  /** Explicit locale override (`"en"` or `"fr"`). */
  readonly locale?: LegendLocale;
}

export interface MeasuredSceneLinkLegend {
  readonly title: string;
  readonly width: number;
  readonly height: number;
  readonly entries: readonly LinkLegendEntry[];
  readonly entityMarks?: readonly LegendEntityMark[];
  readonly padding: number;
  readonly headerHeight: number;
  readonly headerGap: number;
  readonly rowHeight: number;
  readonly rowGap: number;
  readonly swatchWidth: number;
  readonly swatchHeight: number;
  readonly swatchGap: number;
  readonly fontSize: number;
}

export interface BuildSceneLinkLegendInput extends MeasureSceneLinkLegendInput {
  readonly contentBounds: Rect | undefined;
  /** Anchor edge strip or `"auto"` pocket probe (`"right"` by default). `"none"` suppresses the legend. */
  readonly anchor?: LinkLegendAnchor;
  /** Visible node rectangles for `"auto"` corner-pocket collision checks. */
  readonly nodes?: readonly Rect[];
  /** Visible edge label rectangles for `"auto"` corner-pocket collision checks. */
  readonly labelBoxes?: readonly Rect[];
  /** Minimum clearance from nodes, labels, and routed segments for `"pocket"` (`24` px by default). */
  readonly pocketClearance?: number;
}

function measureLegendLineWidth(measureLines: LineMeasurer, text: string): number {
  const request = { text, role: "edge-label" as const, availableWidth: Number.MAX_SAFE_INTEGER, allocatedLines: 1, folded: false };
  const layout = measureLines(request);
  // CardLineMeasure without lineWidths reports the allocation as its width.
  return layout.width >= request.availableWidth || !Number.isFinite(layout.width)
    ? measureLegendFallback(request).width
    : layout.width;
}

/**
 * Pure legend probe for composed layout cache keys (H2.2 / S-1): measures the
 * resolved legend title and all 12 closed connector style labels using the
 * exact request arguments of `measureSceneLinkLegend`.
 */
export function measureLegendProbe(
  measureLines: LineMeasurer,
  title?: string,
  labels?: Readonly<Record<string, string>>,
): readonly number[] {
  const resolvedTitle = title ?? "Legend";
  return [
    measureLegendLineWidth(measureLines, resolvedTitle),
    ...ALL_LINK_LEGEND_STYLES.map((style) =>
      measureLegendLineWidth(measureLines, labels?.[style.key] ?? defaultLinkStyleLabel(style)),
    ),
  ];
}

/**
 * Pure geometry sizing for the automatic link-style legend (H2.2): returns
 * dimensions and row layout independent of anchor placement, or `undefined`
 * when fewer than two distinct connector styles are visible.
 */
export function measureSceneLinkLegend(input: MeasureSceneLinkLegendInput): MeasuredSceneLinkLegend | undefined {
  const collected = collectLinkLegendStyles(input.edges);
  if (collected.length < 2) return undefined;

  const locale = inferLegendLocale(input.title, input.locale);
  const title = input.title ?? defaultLegendTitle(locale);
  const fontSize = input.fontSize ?? LINK_LEGEND_FONT_SIZE;
  const scale = fontSize > 0 && Number.isFinite(fontSize) ? fontSize / LINK_LEGEND_FONT_SIZE : 1;
  const headerHeight = scale === 1 ? LINK_LEGEND_HEADER_HEIGHT : Math.ceil(LINK_LEGEND_HEADER_HEIGHT * scale);
  const headerGap = scale === 1 ? LINK_LEGEND_HEADER_GAP : Math.ceil(LINK_LEGEND_HEADER_GAP * scale);
  const rowHeight = Math.max(
    LINK_LEGEND_SWATCH_HEIGHT,
    scale === 1 ? LINK_LEGEND_ROW_HEIGHT : Math.ceil(LINK_LEGEND_ROW_HEIGHT * scale),
  );
  const rowGap = scale === 1 ? LINK_LEGEND_ROW_GAP : Math.ceil(LINK_LEGEND_ROW_GAP * scale);
  const measureWidth = (text: string): number => measureLegendLineWidth(input.measureLines, text) * scale;
  const scaledTitleWidth = measureWidth(title);

  let maxLabelWidth = 0;
  const entries: LinkLegendEntry[] = collected.map((item, index) => {
    const label = input.labels?.[item.key] ?? defaultLinkStyleLabel(item, locale);
    const scaledWidth = measureWidth(label);
    if (scaledWidth > maxLabelWidth) maxLabelWidth = scaledWidth;
    const rowY =
      LINK_LEGEND_PADDING +
      headerHeight +
      headerGap +
      index * (rowHeight + rowGap);
    return {
      ...item,
      label,
      rowY,
      rowHeight,
    };
  });

  const entityMarks: LegendEntityMark[] = (input.entityMarks ?? []).map((mark, idx) => {
    const label = mark.label ?? defaultLegendMarkLabel(mark.kind, locale);
    const scaledWidth = measureWidth(label);
    if (scaledWidth > maxLabelWidth) maxLabelWidth = scaledWidth;
    const rowY =
      LINK_LEGEND_PADDING +
      headerHeight +
      headerGap +
      (entries.length + idx) * (rowHeight + rowGap);
    return {
      kind: mark.kind,
      label,
      rowY,
      rowHeight,
    };
  });

  const totalRows = entries.length + entityMarks.length;
  const contentWidth = Math.max(
    scaledTitleWidth,
    LINK_LEGEND_SWATCH_WIDTH + LINK_LEGEND_SWATCH_GAP + maxLabelWidth,
  );
  const width = Math.ceil(Math.max(LINK_LEGEND_MIN_WIDTH, 2 * LINK_LEGEND_PADDING + contentWidth));
  const height =
    2 * LINK_LEGEND_PADDING +
    headerHeight +
    headerGap +
    totalRows * rowHeight +
    Math.max(0, totalRows - 1) * rowGap;

  return {
    title,
    width,
    height,
    entries,
    ...(entityMarks.length === 0 ? {} : { entityMarks }),
    padding: LINK_LEGEND_PADDING,
    headerHeight,
    headerGap,
    rowHeight,
    rowGap,
    swatchWidth: LINK_LEGEND_SWATCH_WIDTH,
    swatchHeight: LINK_LEGEND_SWATCH_HEIGHT,
    swatchGap: LINK_LEGEND_SWATCH_GAP,
    fontSize,
  };
}

function rectsOverlapWithClearance(a: Rect, b: Rect, clearance: number): boolean {
  return (
    a.x < b.x + b.width + clearance - 0.5 &&
    a.x + a.width + clearance - 0.5 > b.x &&
    a.y < b.y + b.height + clearance - 0.5 &&
    a.y + a.height + clearance - 0.5 > b.y
  );
}

function segmentIntersectsRectWithClearance(a: Vec2, b: Vec2, rect: Rect, clearance: number): boolean {
  const left = rect.x - clearance;
  const top = rect.y - clearance;
  const right = rect.x + rect.width + clearance;
  const bottom = rect.y + rect.height + clearance;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const tests: readonly [number, number][] = [
    [-dx, a.x - left],
    [dx, right - a.x],
    [-dy, a.y - top],
    [dy, bottom - a.y],
  ];
  for (const [p, q] of tests) {
    if (Math.abs(p) <= 1e-9) {
      if (q < 0) return false;
    } else {
      const r = q / p;
      if (p < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
    }
  }
  return t0 <= t1;
}

/**
 * Find the first empty corner pocket inside `contentBounds` clear of all nodes,
 * labels, and connector segments by `clearance` world units (`24` px default).
 */
export function findLegendPocket(
  size: { readonly width: number; readonly height: number },
  contentBounds: Rect,
  blockers: readonly Rect[],
  routes: readonly (readonly Vec2[])[],
  clearance = LINK_LEGEND_POCKET_CLEARANCE,
): Rect | undefined {
  if (size.width > contentBounds.width || size.height > contentBounds.height) return undefined;
  const candidates: readonly Rect[] = [
    { x: contentBounds.x, y: contentBounds.y, width: size.width, height: size.height },
    {
      x: contentBounds.x + contentBounds.width - size.width,
      y: contentBounds.y + contentBounds.height - size.height,
      width: size.width,
      height: size.height,
    },
    {
      x: contentBounds.x,
      y: contentBounds.y + contentBounds.height - size.height,
      width: size.width,
      height: size.height,
    },
    {
      x: contentBounds.x + contentBounds.width - size.width,
      y: contentBounds.y,
      width: size.width,
      height: size.height,
    },
  ];
  for (const candidate of candidates) {
    if (blockers.some((blocker) => rectsOverlapWithClearance(candidate, blocker, clearance))) continue;
    let hitsRoute = false;
    for (const points of routes) {
      for (let i = 1; i < points.length; i += 1) {
        if (segmentIntersectsRectWithClearance(points[i - 1]!, points[i]!, candidate, clearance)) {
          hitsRoute = true;
          break;
        }
      }
      if (hitsRoute) break;
    }
    if (!hitsRoute) return candidate;
  }
  return undefined;
}

/** Place a measured link-style legend at its anchored edge or inside an explicit cell / pocket rect. */
export function placeSceneLinkLegend(
  measured: MeasuredSceneLinkLegend,
  anchor: SceneLinkLegendAnchor,
  contentBounds: Rect,
  explicitRect?: Rect,
): SceneLinkLegend {
  const rect: Rect =
    (anchor === "free-cell" || anchor === "pocket") && explicitRect !== undefined
      ? { x: explicitRect.x, y: explicitRect.y, width: measured.width, height: measured.height }
      : anchor === "bottom"
        ? {
            x: contentBounds.x,
            y: contentBounds.y + contentBounds.height + LINK_LEGEND_GAP,
            width: measured.width,
            height: measured.height,
          }
        : {
            x: contentBounds.x + contentBounds.width + LINK_LEGEND_GAP,
            y: contentBounds.y,
            width: measured.width,
            height: measured.height,
          };

  return {
    anchor: (anchor === "free-cell" || anchor === "pocket") && explicitRect === undefined ? "right" : anchor,
    title: measured.title,
    rect,
    entries: measured.entries,
    ...(measured.entityMarks === undefined ? {} : { entityMarks: measured.entityMarks }),
    padding: measured.padding,
    headerHeight: measured.headerHeight,
    headerGap: measured.headerGap,
    rowHeight: measured.rowHeight,
    rowGap: measured.rowGap,
    swatchWidth: measured.swatchWidth,
    swatchHeight: measured.swatchHeight,
    swatchGap: measured.swatchGap,
    fontSize: measured.fontSize,
  };
}

/**
 * Compute the automatic link-style legend and its anchored world rectangle
 * (trying empty corner pockets first when `anchor === "auto"`, else outside
 * `contentBounds`). Returns `undefined` when suppressed or when fewer than
 * two distinct styles are drawn.
 */
export function buildSceneLinkLegend(input: BuildSceneLinkLegendInput): SceneLinkLegend | undefined {
  const anchor = input.anchor ?? "right";
  if (anchor === "none" || input.contentBounds === undefined) return undefined;
  const measured = measureSceneLinkLegend(input);
  if (measured === undefined) return undefined;
  if (anchor === "auto") {
    const pocket = findLegendPocket(
      measured,
      input.contentBounds,
      [...(input.nodes ?? []), ...(input.labelBoxes ?? [])],
      input.edges.map((edge) => edge.points ?? []).filter((pts) => pts.length >= 2),
      input.pocketClearance,
    );
    if (pocket !== undefined) {
      return placeSceneLinkLegend(measured, "pocket", input.contentBounds, pocket);
    }
    return placeSceneLinkLegend(measured, "right", input.contentBounds);
  }
  return placeSceneLinkLegend(measured, anchor, input.contentBounds);
}

/**
 * Shared inline CSS positioning and geometry custom properties for HTML legend
 * hosts (Svelte and Vue), keeping every box, header, gap, row and swatch pixel
 * identical to `buildSceneLinkLegend` and `renderSceneSvg` at every `edgeLabelSize`.
 */
export function linkLegendBoxStyle(legend: SceneLinkLegend, opacity?: number): string {
  return (
    `left:${legend.rect.x}px;top:${legend.rect.y}px;width:${legend.rect.width}px;height:${legend.rect.height}px;` +
    `--st-diagram-legend-padding:${legend.padding}px;` +
    `--st-diagram-legend-header-height:${legend.headerHeight}px;` +
    `--st-diagram-legend-header-gap:${legend.headerGap}px;` +
    `--st-diagram-legend-row-height:${legend.rowHeight}px;` +
    `--st-diagram-legend-row-gap:${legend.rowGap}px;` +
    `--st-diagram-legend-swatch-width:${legend.swatchWidth}px;` +
    `--st-diagram-legend-swatch-height:${legend.swatchHeight}px;` +
    `--st-diagram-legend-swatch-gap:${legend.swatchGap}px;` +
    `--st-diagram-legend-radius:${LINK_LEGEND_CORNER_RADIUS}px;` +
    `--st-diagram-legend-font-size:${legend.fontSize}px` +
    (opacity === undefined ? "" : `;opacity:${opacity}`)
  );
}

/**
 * Inline SVG swatch geometry for a legend entry. Draws the sample line and
 * arrowhead directly without `<marker>` ids so SVG, Svelte and Vue stay
 * id-collision-free and DOM-identical.
 */
export function linkLegendSwatchGeometry(
  style: LinkLegendStyleKey,
  widths?: Pick<LayoutMetrics, "linkStrokeWidth" | "linkRelatedStrokeWidth" | "linkEmphasisStrokeWidth">,
): LinkLegendSwatchGeometry {
  const emphasized = style.emphasis === "emphasis";
  const stroke = emphasized ? EMPHASIS_STROKE : EDGE_STROKE;
  const strokeWidth = connectorStrokeWidth(style, widths);
  const dashArray = connectorDashArray(style.strokeStyle);
  const tipX = LINK_LEGEND_SWATCH_WIDTH - 2;
  const lineEnd = style.arrowhead === "none" ? tipX : tipX - 8;
  const linePath = `M2 8H${lineEnd}`;
  const arrowBaseX = tipX - 10;

  if (style.arrowhead === "none") {
    return {
      viewBox: `0 0 ${LINK_LEGEND_SWATCH_WIDTH} ${LINK_LEGEND_SWATCH_HEIGHT}`,
      width: LINK_LEGEND_SWATCH_WIDTH,
      height: LINK_LEGEND_SWATCH_HEIGHT,
      linePath,
      stroke,
      strokeWidth,
      ...(dashArray === undefined ? {} : { dashArray }),
    };
  }
  return {
    viewBox: `0 0 ${LINK_LEGEND_SWATCH_WIDTH} ${LINK_LEGEND_SWATCH_HEIGHT}`,
    width: LINK_LEGEND_SWATCH_WIDTH,
    height: LINK_LEGEND_SWATCH_HEIGHT,
    linePath,
    arrowPath: `M${arrowBaseX} 3L${tipX} 8L${arrowBaseX} 13Z`,
    stroke,
    strokeWidth,
    ...(dashArray === undefined ? {} : { dashArray }),
    arrowFill: stroke,
  };
}
