import type { LinkEmphasis, StrokeStyle } from "@sentropic/diagram-core";
import { simplifyElbowPoints } from "../presentation/connectorPath.js";
import type { Rect, Vec2 } from "../transform.js";

/** Five closed `r7` connector stroke weight tiers mapped to CSS-px arrowhead specs. */
export type ConnectorWeightTier = "subtle" | "default" | "strong" | "heavy" | "double-rail";

export interface ConnectorHeadCssSpec {
  readonly tier: ConnectorWeightTier;
  readonly strokeCss: number;
  readonly lengthCss: number;
  readonly widthCss: number;
  readonly pullbackCss: number;
}

export const CONNECTOR_HEAD_SPECS: Readonly<Record<ConnectorWeightTier, ConnectorHeadCssSpec>> = Object.freeze({
  subtle: Object.freeze({ tier: "subtle", strokeCss: 2, lengthCss: 10.5, widthCss: 8.8, pullbackCss: 9.0 }),
  default: Object.freeze({ tier: "default", strokeCss: 3.5, lengthCss: 14.8, widthCss: 12.4, pullbackCss: 13.5 }),
  strong: Object.freeze({ tier: "strong", strokeCss: 5, lengthCss: 17.0, widthCss: 14.3, pullbackCss: 15.5 }),
  heavy: Object.freeze({ tier: "heavy", strokeCss: 6.5, lengthCss: 19.0, widthCss: 16.0, pullbackCss: 17.5 }),
  "double-rail": Object.freeze({ tier: "double-rail", strokeCss: 7, lengthCss: 20.0, widthCss: 16.8, pullbackCss: 18.5 }),
});

/** Map stroke width and emphasis (including D-DE3-1 `5 px` emphasis -> `strong`) to a CSS-px arrowhead spec. */
export function resolveConnectorHeadCssSpec(input: {
  readonly emphasis?: LinkEmphasis;
  readonly strokeWidthCss?: number;
  readonly strokeStyle?: StrokeStyle;
}): ConnectorHeadCssSpec {
  const w = input.strokeWidthCss;
  if (w !== undefined) {
    if (w >= 6.75) return CONNECTOR_HEAD_SPECS["double-rail"];
    if (w >= 6.0) return CONNECTOR_HEAD_SPECS.heavy;
    if (w >= 4.5) return CONNECTOR_HEAD_SPECS.strong;
    if (w <= 2.25) return CONNECTOR_HEAD_SPECS.subtle;
  }
  if (input.emphasis === "emphasis") return CONNECTOR_HEAD_SPECS.strong;
  return CONNECTOR_HEAD_SPECS.default;
}

export interface SceneEdgeHead {
  /** Closed polygon path (`M tip L left L right Z`) in world coordinates. */
  readonly path: string;
  /** Exact untrimmed arrival dock point (`edge.points.at(-1)`). */
  readonly tip: Vec2;
  readonly lengthWorld: number;
  readonly widthWorld: number;
  readonly pullbackWorld: number;
  /** Axis-aligned world bounding box enclosing the triangle polygon. */
  readonly box: Rect;
}

const EPSILON = 1e-6;

function fmt(value: number): string {
  const cleaned = Number(value.toPrecision(12));
  return String(cleaned === 0 ? 0 : cleaned);
}

function clean(value: number): number {
  return Number(value.toPrecision(12)) === 0 ? 0 : Number(value.toPrecision(12));
}

export interface EdgeArrivalSegment {
  readonly id: string;
  readonly prev: Vec2;
  readonly tip: Vec2;
  readonly ux: number;
  readonly uy: number;
  readonly lastRunLen: number;
  readonly rEnd: number;
}

/** Extract the final simplified arrival vector and pre-head bend radius `rEnd` for an untrimmed route. */
export function extractEdgeArrivalSegment(
  id: string,
  points: readonly Vec2[],
  cornerRadius: number,
): EdgeArrivalSegment | undefined {
  if (points.length < 2) return undefined;
  const simplified = simplifyElbowPoints(points);
  if (simplified.length < 2) return undefined;
  const prev = simplified[simplified.length - 2]!;
  const tip = simplified[simplified.length - 1]!;
  const dx = tip.x - prev.x;
  const dy = tip.y - prev.y;
  const lastRunLen = Math.hypot(dx, dy);
  if (lastRunLen <= EPSILON) return undefined;
  const ux = dx / lastRunLen;
  const uy = dy / lastRunLen;
  let rEnd = 0;
  const safeRadius = Number.isFinite(cornerRadius) && cornerRadius > 0 ? cornerRadius : 0;
  if (simplified.length >= 3 && safeRadius > EPSILON) {
    const prev2 = simplified[simplified.length - 3]!;
    const inDx = prev.x - prev2.x;
    const inDy = prev.y - prev2.y;
    const inLen = Math.hypot(inDx, inDy);
    if (inLen > EPSILON) {
      const cross = (inDx * dy - inDy * dx) / (inLen * lastRunLen);
      if (Math.abs(cross) > EPSILON) {
        rEnd = Math.min(safeRadius, inLen / 2, lastRunLen / 2);
      }
    }
  }
  return { id, prev, tip, ux, uy, lastRunLen, rEnd };
}

/**
 * Compute minimum centre-to-centre world distance to an adjacent parallel
 * headed arrival track so `maxWidthWorld = neighborSpacing - 2` prevents
 * adjacent arrowheads from overlapping on parallel `24 u` tracks.
 */
export function computeNeighborArrivalSpacing(
  target: EdgeArrivalSegment,
  allArrivals: readonly EdgeArrivalSegment[],
  longitudinalWindowWorld = 100,
): number {
  let minPerp = Infinity;
  const nx = -target.uy;
  const ny = target.ux;
  for (const other of allArrivals) {
    if (other.id === target.id) continue;
    // Same arrival direction (parallel tracks landing side by side on the same corridor/face).
    const alignDot = target.ux * other.ux + target.uy * other.uy;
    if (alignDot <= 0.99) continue;
    const dtx = other.tip.x - target.tip.x;
    const dty = other.tip.y - target.tip.y;
    const alongDist = Math.abs(dtx * target.ux + dty * target.uy);
    if (alongDist > longitudinalWindowWorld) continue;
    const perpDist = Math.abs(dtx * nx + dty * ny);
    // Ignore coincident merged comb trunks (`perpDist <= 0.5`).
    if (perpDist > 0.5 && perpDist < minPerp) {
      minPerp = perpDist;
    }
  }
  return minPerp;
}

/**
 * Compute single-source world-unit head polygon, pullback, and bounding box
 * clamped to the straight arrival leg after the final bend (`lastRunLen - rEnd - 1`)
 * and to `neighborSpacing - 2`.
 */
export function resolveConnectorHead(input: {
  readonly points: readonly Vec2[];
  readonly cssSpec: ConnectorHeadCssSpec;
  readonly cornerRadius: number;
  readonly clearanceZoom: number;
  readonly neighborSpacing?: number;
}): SceneEdgeHead | undefined {
  const arrival = extractEdgeArrivalSegment("edge", input.points, input.cornerRadius);
  if (arrival === undefined) return undefined;
  const safeZoom = input.clearanceZoom > EPSILON && Number.isFinite(input.clearanceZoom) ? input.clearanceZoom : 0.45;

  const rawLengthWorld = input.cssSpec.lengthCss / safeZoom;
  const rawWidthWorld = input.cssSpec.widthCss / safeZoom;
  const rawPullbackWorld = input.cssSpec.pullbackCss / safeZoom;

  const straightRoom = Math.max(0, arrival.lastRunLen - arrival.rEnd - 1);
  const maxLengthWorld = Math.max(6, straightRoom);
  const neighbor = input.neighborSpacing ?? Infinity;
  const maxWidthWorld = Number.isFinite(neighbor) ? Math.max(6, neighbor - 2) : Infinity;

  const scale = Math.min(1, maxLengthWorld / rawLengthWorld, maxWidthWorld / rawWidthWorld);
  const lengthWorld = clean(Math.min(rawLengthWorld * scale, arrival.lastRunLen));
  const widthWorld = clean(rawWidthWorld * scale);
  const pullbackWorld = clean(
    Math.max(0, Math.min(rawPullbackWorld * scale, lengthWorld - 1.5 / safeZoom, straightRoom)),
  );

  const { tip, ux, uy } = arrival;
  const nx = -uy;
  const ny = ux;
  const baseX = tip.x - ux * lengthWorld;
  const baseY = tip.y - uy * lengthWorld;
  const halfW = widthWorld / 2;
  const left = { x: baseX + nx * halfW, y: baseY + ny * halfW };
  const right = { x: baseX - nx * halfW, y: baseY - ny * halfW };

  const minX = Math.min(tip.x, left.x, right.x);
  const minY = Math.min(tip.y, left.y, right.y);
  const maxX = Math.max(tip.x, left.x, right.x);
  const maxY = Math.max(tip.y, left.y, right.y);

  return {
    path: `M${fmt(tip.x)} ${fmt(tip.y)} L${fmt(left.x)} ${fmt(left.y)} L${fmt(right.x)} ${fmt(right.y)} Z`,
    tip: { x: tip.x, y: tip.y },
    lengthWorld,
    widthWorld,
    pullbackWorld,
    box: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
  };
}
