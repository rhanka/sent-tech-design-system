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
  readonly open: string;
  readonly filledEmphasis: string;
  readonly openEmphasis: string;
}

export interface ConnectorMarkerSpec {
  readonly id: string;
  readonly kind: "filled-triangle" | "open-triangle";
  readonly emphasis: LinkEmphasis;
  readonly viewBox: string;
  readonly refX: number;
  readonly refY: number;
  readonly markerWidth: number;
  readonly markerHeight: number;
  readonly orient: "auto-start-reverse";
  readonly path: string;
  readonly fill: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
}

/**
 * Closed marker geometry table for the arrowhead registry (DE-2).
 * Consumers select arrowheads strictly by closed words from the view /
 * presentation; hosts paint them from this shared table.
 */
export const ARROWHEAD_MARKER_GEOMETRY = Object.freeze({
  "filled-triangle": Object.freeze({
    viewBox: "0 0 10 10",
    refX: 9,
    refY: 5,
    markerWidth: 7,
    markerHeight: 7,
    orient: "auto-start-reverse" as const,
    path: "M0 0L10 5L0 10Z",
  }),
  "open-triangle": Object.freeze({
    viewBox: "0 0 10 10",
    refX: 9,
    refY: 5,
    markerWidth: 8,
    markerHeight: 8,
    orient: "auto-start-reverse" as const,
    path: "M1 1L9 5L1 9Z",
  }),
});

const EDGE_STROKE = "var(--st-component-diagramScene-edgeStroke, #64748b)";
const EMPHASIS_STROKE = "var(--st-component-diagramScene-linkEmphasisStroke, #2563eb)";
const OPEN_SURFACE_FILL = "var(--st-semantic-surface-raised, #ffffff)";

/** Derive deterministic per-host marker ids keeping the default filled arrow id first. */
export function connectorMarkerIds(baseArrowId: string): ConnectorMarkerIds {
  return {
    filled: baseArrowId,
    open: `${baseArrowId}-open`,
    filledEmphasis: `${baseArrowId}-emphasis`,
    openEmphasis: `${baseArrowId}-open-emphasis`,
  };
}

/** Map a closed `StrokeStyle` registry word to its SVG `stroke-dasharray` value (absent for solid). */
export function connectorDashArray(strokeStyle: StrokeStyle | undefined): string | undefined {
  const descriptor = resolveDashPattern(strokeStyle);
  if (descriptor === undefined || descriptor.dashArray.length === 0) return undefined;
  return descriptor.dashArray.join(" ");
}

/** Normalize a closed `ArrowheadKind` word (`"arrow"` aliases `"filled-triangle"`). */
export function connectorMarkerKind(arrowhead: ArrowheadKind | undefined): CanonicalArrowheadKind {
  return resolveArrowhead(arrowhead)?.canonicalKind ?? "filled-triangle";
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
  if (kind === "open-triangle") {
    return `url(#${emphasized ? ids.openEmphasis : ids.open})`;
  }
  return `url(#${emphasized ? ids.filledEmphasis : ids.filled})`;
}

/**
 * Additional `<marker>` definitions required by the scene beyond the default
 * filled-triangle marker (which hosts always emit first in `<defs>`).
 */
export function extraConnectorMarkers(
  edges: readonly ConnectorMarkerEdgeInput[],
  ids: ConnectorMarkerIds,
): readonly ConnectorMarkerSpec[] {
  let needOpen = false;
  let needFilledEmphasis = false;
  let needOpenEmphasis = false;
  for (const edge of edges) {
    if (edge.markers !== undefined || edge.directed === true) continue;
    const kind = connectorMarkerKind(edge.arrowhead);
    if (kind === "none") continue;
    const emphasized = edge.emphasis === "emphasis";
    if (kind === "open-triangle") {
      if (emphasized) needOpenEmphasis = true;
      else needOpen = true;
    } else if (emphasized) {
      needFilledEmphasis = true;
    }
  }
  const specs: ConnectorMarkerSpec[] = [];
  if (needOpen) {
    specs.push({
      id: ids.open,
      kind: "open-triangle",
      emphasis: "default",
      ...ARROWHEAD_MARKER_GEOMETRY["open-triangle"],
      fill: OPEN_SURFACE_FILL,
      stroke: EDGE_STROKE,
      strokeWidth: 1.5,
    });
  }
  if (needFilledEmphasis) {
    specs.push({
      id: ids.filledEmphasis,
      kind: "filled-triangle",
      emphasis: "emphasis",
      ...ARROWHEAD_MARKER_GEOMETRY["filled-triangle"],
      fill: EMPHASIS_STROKE,
    });
  }
  if (needOpenEmphasis) {
    specs.push({
      id: ids.openEmphasis,
      kind: "open-triangle",
      emphasis: "emphasis",
      ...ARROWHEAD_MARKER_GEOMETRY["open-triangle"],
      fill: OPEN_SURFACE_FILL,
      stroke: EMPHASIS_STROKE,
      strokeWidth: 1.5,
    });
  }
  return specs;
}
