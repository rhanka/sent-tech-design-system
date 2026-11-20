/**
 * Closed connector presentation registries (DE-2): dash patterns, arrowhead
 * kinds (ready for ArchiMate later), and link emphasis.
 *
 * Connectors are selected strictly by closed vocabulary words from the view /
 * presentation layer — never by raw SVG geometry, dash-array strings, marker
 * path data, or colour/width literals. Emphasis is a distinct colour + width
 * axis and is NEVER a dash style (`dashed` continues to mean "proposed").
 *
 * Pure deeply-frozen data, zero runtime dependencies, zero DOM.
 */

export const STROKE_STYLES = ["solid", "dashed", "dotted"] as const;
export type StrokeStyle = (typeof STROKE_STYLES)[number];

export interface DashPatternDescriptor {
  readonly style: StrokeStyle;
  /** Semantic meaning of the pattern (`dashed` already means "proposed"). */
  readonly meaning: "default" | "proposed" | "dotted";
  /** World-unit dash/gap fallback pattern when CSS tokens are absent. */
  readonly dashArray: readonly number[];
  /** Component token key under `diagramScene.*`, omitted for solid strokes. */
  readonly tokenName?: "linkDashDashed" | "linkDashDotted";
}

export const ARROWHEAD_KINDS = ["arrow", "filled-triangle", "open-triangle", "none"] as const;
export type ArrowheadKind = (typeof ARROWHEAD_KINDS)[number];
export type CanonicalArrowheadKind = "filled-triangle" | "open-triangle" | "none";

export interface ArrowheadDescriptor {
  readonly kind: ArrowheadKind;
  /** Normalized visual head kind (`"arrow"` aliases `"filled-triangle"`). */
  readonly canonicalKind: CanonicalArrowheadKind;
  readonly shape: "triangle" | "none";
  readonly fill: "stroke" | "surface" | "none";
  readonly outlined: boolean;
}

export const LINK_EMPHASIS_KINDS = ["default", "emphasis"] as const;
export type LinkEmphasis = (typeof LINK_EMPHASIS_KINDS)[number];

export interface LinkEmphasisDescriptor {
  readonly emphasis: LinkEmphasis;
  readonly strokeToken: "edgeStroke" | "linkEmphasisStroke";
  readonly widthToken: "linkStrokeWidth" | "linkEmphasisStrokeWidth";
  /** Emphasis is strictly a colour + width axis, never a dash style. */
  readonly changesDash: false;
}

/**
 * Word-addressed connector presentation for a relation occurrence.
 * Every field is a closed registry word; raw geometry is refused.
 */
export interface RelationPresentation {
  readonly strokeStyle?: StrokeStyle;
  readonly arrowhead?: ArrowheadKind;
  readonly emphasis?: LinkEmphasis;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  return Object.freeze(value);
}

export const DASH_PATTERN_REGISTRY: Readonly<Record<StrokeStyle, DashPatternDescriptor>> = deepFreeze({
  solid: {
    style: "solid",
    meaning: "default",
    dashArray: [],
  },
  dashed: {
    style: "dashed",
    meaning: "proposed",
    dashArray: [8, 6],
    tokenName: "linkDashDashed",
  },
  dotted: {
    style: "dotted",
    meaning: "dotted",
    dashArray: [2, 5],
    tokenName: "linkDashDotted",
  },
});

export const ARROWHEAD_REGISTRY: Readonly<Record<ArrowheadKind, ArrowheadDescriptor>> = deepFreeze({
  arrow: {
    kind: "arrow",
    canonicalKind: "filled-triangle",
    shape: "triangle",
    fill: "stroke",
    outlined: false,
  },
  "filled-triangle": {
    kind: "filled-triangle",
    canonicalKind: "filled-triangle",
    shape: "triangle",
    fill: "stroke",
    outlined: false,
  },
  "open-triangle": {
    kind: "open-triangle",
    canonicalKind: "open-triangle",
    shape: "triangle",
    fill: "surface",
    outlined: true,
  },
  none: {
    kind: "none",
    canonicalKind: "none",
    shape: "none",
    fill: "none",
    outlined: false,
  },
});

export const LINK_EMPHASIS_REGISTRY: Readonly<Record<LinkEmphasis, LinkEmphasisDescriptor>> = deepFreeze({
  default: {
    emphasis: "default",
    strokeToken: "edgeStroke",
    widthToken: "linkStrokeWidth",
    changesDash: false,
  },
  emphasis: {
    emphasis: "emphasis",
    strokeToken: "linkEmphasisStroke",
    widthToken: "linkEmphasisStrokeWidth",
    changesDash: false,
  },
});

const STROKE_STYLE_SET: ReadonlySet<string> = new Set(STROKE_STYLES);
const ARROWHEAD_KIND_SET: ReadonlySet<string> = new Set(ARROWHEAD_KINDS);
const LINK_EMPHASIS_SET: ReadonlySet<string> = new Set(LINK_EMPHASIS_KINDS);

export function isStrokeStyle(value: unknown): value is StrokeStyle {
  return typeof value === "string" && STROKE_STYLE_SET.has(value);
}

export function isArrowheadKind(value: unknown): value is ArrowheadKind {
  return typeof value === "string" && ARROWHEAD_KIND_SET.has(value);
}

export function isLinkEmphasis(value: unknown): value is LinkEmphasis {
  return typeof value === "string" && LINK_EMPHASIS_SET.has(value);
}

export function resolveDashPattern(style: StrokeStyle | undefined): DashPatternDescriptor;
export function resolveDashPattern(style: string | undefined): DashPatternDescriptor | undefined;
export function resolveDashPattern(style: string | undefined): DashPatternDescriptor | undefined {
  if (style === undefined) return DASH_PATTERN_REGISTRY.solid;
  return isStrokeStyle(style) ? DASH_PATTERN_REGISTRY[style] : undefined;
}

export function resolveArrowhead(kind: ArrowheadKind | undefined): ArrowheadDescriptor;
export function resolveArrowhead(kind: string | undefined): ArrowheadDescriptor | undefined;
export function resolveArrowhead(kind: string | undefined): ArrowheadDescriptor | undefined {
  if (kind === undefined) return ARROWHEAD_REGISTRY["filled-triangle"];
  return isArrowheadKind(kind) ? ARROWHEAD_REGISTRY[kind] : undefined;
}

export function resolveLinkEmphasis(emphasis: LinkEmphasis | undefined): LinkEmphasisDescriptor;
export function resolveLinkEmphasis(emphasis: string | undefined): LinkEmphasisDescriptor | undefined;
export function resolveLinkEmphasis(emphasis: string | undefined): LinkEmphasisDescriptor | undefined {
  if (emphasis === undefined) return LINK_EMPHASIS_REGISTRY.default;
  return isLinkEmphasis(emphasis) ? LINK_EMPHASIS_REGISTRY[emphasis] : undefined;
}
