import {
  resolveArrowhead,
  resolveDashPattern,
  type ArrowheadKind,
  type CanonicalArrowheadKind,
  type LinkEmphasis,
  type StrokeStyle,
} from "@sentropic/diagram-core";

export interface ConnectorMarkerIds {
  readonly filled: string;
  readonly filledEmphasis: string;
}

export interface ConnectorMarkerSpec {
  readonly id: string;
  readonly kind: "arrow";
  readonly emphasis: LinkEmphasis;
  readonly viewBox: string;
  readonly refX: number;
  readonly refY: number;
  readonly markerUnits: "userSpaceOnUse";
  readonly markerWidth: number;
  readonly markerHeight: number;
  readonly orient: "auto-start-reverse";
  readonly path: string;
  readonly fill: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
}

/**
 * Closed marker geometry table for the `@4` arrowhead registry (`arrow | none`, DE-2).
 * Uses `markerUnits="userSpaceOnUse"` at `10.5 × 10.5` world units so raising
 * `linkStrokeWidth` (`1.5 → 2.5/3.5px`) preserves the pre-DE-2 arrowhead size
 * (`7 × 1.5 = 10.5`). Additional heads (hollow triangles, diamonds) are reserved for N2.
 */
export const ARROWHEAD_MARKER_GEOMETRY = Object.freeze({
  arrow: Object.freeze({
    viewBox: "0 0 10 10",
    refX: 9,
    refY: 5,
    markerUnits: "userSpaceOnUse" as const,
    markerWidth: 10.5,
    markerHeight: 10.5,
    orient: "auto-start-reverse" as const,
    path: "M0 0L10 5L0 10Z",
  }),
});

/**
 * Single emphasis-stroke token expression shared across Svelte, Vue and SVG
 * targets (`--st-component-diagramScene-linkEmphasisStroke`, falling back to
 * `--st-semantic-border-interactive` and the light core-theme value `#001f33`).
 */
export const LINK_EMPHASIS_STROKE_FALLBACK = "#001f33";
export const LINK_EMPHASIS_STROKE =
  `var(--st-component-diagramScene-linkEmphasisStroke, var(--st-semantic-border-interactive, ${LINK_EMPHASIS_STROKE_FALLBACK}))`;

/** Derive deterministic per-host marker ids keeping the default arrow id first. */
export function connectorMarkerIds(baseArrowId: string): ConnectorMarkerIds {
  return {
    filled: baseArrowId,
    filledEmphasis: `${baseArrowId}-emphasis`,
  };
}

/** Map a closed `StrokeStyle` registry word to its SVG `stroke-dasharray` value (absent for solid). */
export function connectorDashArray(strokeStyle: StrokeStyle | undefined): string | undefined {
  const descriptor = resolveDashPattern(strokeStyle);
  if (descriptor === undefined || descriptor.dashArray.length === 0) return undefined;
  return descriptor.dashArray.join(" ");
}

/** Normalize a closed `ArrowheadKind` word (`arrow | none`). */
export function connectorMarkerKind(arrowhead: ArrowheadKind | undefined): CanonicalArrowheadKind {
  return resolveArrowhead(arrowhead)?.canonicalKind ?? "arrow";
}

export interface ConnectorMarkerEdgeInput {
  readonly markers?: string;
  readonly directed?: boolean;
  readonly arrowhead?: ArrowheadKind;
  readonly emphasis?: LinkEmphasis;
}

/** Resolve the `marker-end` URL reference for one scene edge, or `undefined` when suppressed (`none`, ERD, flow). */
export function connectorMarkerRef(
  edge: ConnectorMarkerEdgeInput,
  ids: ConnectorMarkerIds,
): string | undefined {
  if (edge.markers !== undefined || edge.directed === true) return undefined;
  const kind = connectorMarkerKind(edge.arrowhead);
  if (kind === "none") return undefined;
  const emphasized = edge.emphasis === "emphasis";
  return `url(#${emphasized ? ids.filledEmphasis : ids.filled})`;
}

/**
 * Additional `<marker>` definitions required by the scene beyond the default
 * arrow marker (which hosts always emit first in `<defs>`).
 */
export function extraConnectorMarkers(
  edges: readonly ConnectorMarkerEdgeInput[],
  ids: ConnectorMarkerIds,
): readonly ConnectorMarkerSpec[] {
  let needFilledEmphasis = false;
  for (const edge of edges) {
    if (edge.markers !== undefined || edge.directed === true) continue;
    const kind = connectorMarkerKind(edge.arrowhead);
    if (kind === "none") continue;
    if (edge.emphasis === "emphasis") {
      needFilledEmphasis = true;
    }
  }
  const specs: ConnectorMarkerSpec[] = [];
  if (needFilledEmphasis) {
    specs.push({
      id: ids.filledEmphasis,
      kind: "arrow",
      emphasis: "emphasis",
      ...ARROWHEAD_MARKER_GEOMETRY.arrow,
      fill: LINK_EMPHASIS_STROKE,
    });
  }
  return specs;
}
