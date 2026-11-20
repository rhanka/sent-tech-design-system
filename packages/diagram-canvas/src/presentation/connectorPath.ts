import type { Rect, Vec2 } from "../transform.js";

/**
 * Default corner radius for rounded-elbow connectors, world units (DE-2).
 * Mirrors the `--st-component-diagramScene-edgeCornerRadius` token (`12px`).
 */
export const DEFAULT_EDGE_CORNER_RADIUS = 12;

const EPSILON = 1e-6;

function formatCoord(value: number): string {
  const cleaned = Number(value.toPrecision(12));
  return String(cleaned === 0 ? 0 : cleaned);
}

/**
 * Remove consecutive duplicate points and redundant forward-collinear interior
 * points while preserving the exact first and last dock coordinates.
 */
function simplifyElbowPoints(points: readonly Vec2[]): Vec2[] {
  if (points.length <= 1) return points.map((p) => ({ x: p.x, y: p.y }));
  const dedup: Vec2[] = [{ x: points[0]!.x, y: points[0]!.y }];
  for (let i = 1; i < points.length; i += 1) {
    const point = points[i]!;
    const prev = dedup[dedup.length - 1]!;
    if (Math.hypot(point.x - prev.x, point.y - prev.y) > EPSILON) {
      dedup.push({ x: point.x, y: point.y });
    }
  }
  if (dedup.length === 1) {
    // All input points coincided: preserve degenerate 2-point dock contact.
    const last = points[points.length - 1]!;
    dedup.push({ x: last.x, y: last.y });
    return dedup;
  }
  // Keep exact terminal dock point even when the final step was sub-epsilon.
  const end = points[points.length - 1]!;
  dedup[dedup.length - 1] = { x: end.x, y: end.y };

  if (dedup.length <= 2) return dedup;
  const simplified: Vec2[] = [dedup[0]!];
  for (let i = 1; i < dedup.length - 1; i += 1) {
    const prev = simplified[simplified.length - 1]!;
    const curr = dedup[i]!;
    const next = dedup[i + 1]!;
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const len1 = Math.hypot(dx1, dy1);
    const len2 = Math.hypot(dx2, dy2);
    if (len1 <= EPSILON || len2 <= EPSILON) continue;
    const cross = (dx1 * dy2 - dy1 * dx2) / (len1 * len2);
    const dot = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);
    // Drop forward-collinear interior points so they never cap an adjacent bend.
    if (Math.abs(cross) <= EPSILON && dot > 0) continue;
    simplified.push(curr);
  }
  simplified.push(dedup[dedup.length - 1]!);
  return simplified;
}

/**
 * Shared SVG `<path d="...">` builder for connectors with rounded elbows (DE-2).
 *
 * Replaces sharp polyline corners with quadratic Bézier curves (`Q`) whose
 * radius is `cornerRadius` (default `12` world units) capped at half the
 * shorter adjoining leg (`min(radius, lenIn / 2, lenOut / 2)`). Adjacent bends
 * sharing a leg therefore never overlap, and the path always begins on the
 * exact start dock (`M x0 y0`) and finishes on the exact end dock (`L xn yn`)
 * with a non-zero arrival segment for `marker-end` orientation.
 */
export function connectorPath(
  points: readonly Vec2[],
  cornerRadius: number = DEFAULT_EDGE_CORNER_RADIUS,
): string {
  if (points.length < 2) return "";
  const simplified = simplifyElbowPoints(points);
  const safeRadius = Number.isFinite(cornerRadius) && cornerRadius > 0 ? cornerRadius : 0;
  const start = simplified[0]!;
  const parts: string[] = [`M${formatCoord(start.x)} ${formatCoord(start.y)}`];
  let cursorX = start.x;
  let cursorY = start.y;

  for (let i = 1; i < simplified.length - 1; i += 1) {
    const prev = simplified[i - 1]!;
    const corner = simplified[i]!;
    const next = simplified[i + 1]!;
    const inX = corner.x - prev.x;
    const inY = corner.y - prev.y;
    const outX = next.x - corner.x;
    const outY = next.y - corner.y;
    const inLen = Math.hypot(inX, inY);
    const outLen = Math.hypot(outX, outY);
    const r = Math.min(safeRadius, inLen / 2, outLen / 2);
    const cross = inLen > EPSILON && outLen > EPSILON ? (inX * outY - inY * outX) / (inLen * outLen) : 0;

    if (r <= EPSILON || Math.abs(cross) <= EPSILON) {
      parts.push(`L${formatCoord(corner.x)} ${formatCoord(corner.y)}`);
      cursorX = corner.x;
      cursorY = corner.y;
      continue;
    }

    const enterX = corner.x - (inX / inLen) * r;
    const enterY = corner.y - (inY / inLen) * r;
    const exitX = corner.x + (outX / outLen) * r;
    const exitY = corner.y + (outY / outLen) * r;

    if (Math.hypot(enterX - cursorX, enterY - cursorY) > EPSILON) {
      parts.push(`L${formatCoord(enterX)} ${formatCoord(enterY)}`);
    }
    parts.push(`Q${formatCoord(corner.x)} ${formatCoord(corner.y)} ${formatCoord(exitX)} ${formatCoord(exitY)}`);
    cursorX = exitX;
    cursorY = exitY;
  }

  const end = simplified[simplified.length - 1]!;
  parts.push(`L${formatCoord(end.x)} ${formatCoord(end.y)}`);
  return parts.join(" ");
}

/**
 * Tight axis-aligned bounding boxes covering the two quadratic Bézier halves
 * (`[enter, mid]` and `[mid, exit]`) of every rounded bend emitted by
 * `connectorPath`. Because the Bézier curve and its midpoint chords stay
 * inside these two rectangles, clearing them guarantees label clearance
 * around rounded elbows as well as straight legs.
 */
export function connectorCornerBounds(
  points: readonly Vec2[],
  cornerRadius: number = DEFAULT_EDGE_CORNER_RADIUS,
): Rect[] {
  if (points.length < 3 || !Number.isFinite(cornerRadius) || cornerRadius <= 0) return [];
  const simplified = simplifyElbowPoints(points);
  const boxes: Rect[] = [];
  for (let i = 1; i < simplified.length - 1; i += 1) {
    const prev = simplified[i - 1]!;
    const corner = simplified[i]!;
    const next = simplified[i + 1]!;
    const inX = corner.x - prev.x;
    const inY = corner.y - prev.y;
    const outX = next.x - corner.x;
    const outY = next.y - corner.y;
    const inLen = Math.hypot(inX, inY);
    const outLen = Math.hypot(outX, outY);
    const r = Math.min(cornerRadius, inLen / 2, outLen / 2);
    const cross = inLen > EPSILON && outLen > EPSILON ? (inX * outY - inY * outX) / (inLen * outLen) : 0;
    if (r <= EPSILON || Math.abs(cross) <= EPSILON) continue;
    const enterX = corner.x - (inX / inLen) * r;
    const enterY = corner.y - (inY / inLen) * r;
    const exitX = corner.x + (outX / outLen) * r;
    const exitY = corner.y + (outY / outLen) * r;
    const midX = 0.25 * enterX + 0.5 * corner.x + 0.25 * exitX;
    const midY = 0.25 * enterY + 0.5 * corner.y + 0.25 * exitY;
    boxes.push(
      {
        x: Math.min(enterX, midX),
        y: Math.min(enterY, midY),
        width: Math.abs(enterX - midX),
        height: Math.abs(enterY - midY),
      },
      {
        x: Math.min(midX, exitX),
        y: Math.min(midY, exitY),
        width: Math.abs(midX - exitX),
        height: Math.abs(midY - exitY),
      },
    );
  }
  return boxes;
}

/**
 * Parse a `connectorPath` SVG `d` string (`M`, `L`, `Q`) into ordered sampled
 * points along the rendered curve: the first point is always the exact start
 * dock and the last point is always the exact end dock.
 */
export function parseConnectorPath(d: string): readonly Vec2[] {
  const tokens = d.match(/[MLQ]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi);
  if (tokens === null) return [];
  const out: Vec2[] = [];
  let index = 0;
  let command = "";
  let current: Vec2 | undefined;

  while (index < tokens.length) {
    const token = tokens[index]!;
    if (/^[MLQ]$/i.test(token)) {
      command = token.toUpperCase();
      index += 1;
      continue;
    }
    if (command === "M" || command === "L") {
      const x = Number(tokens[index]);
      const y = Number(tokens[index + 1]);
      index += 2;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return [];
      current = { x, y };
      out.push(current);
      if (command === "M") command = "L";
    } else if (command === "Q") {
      const cx = Number(tokens[index]);
      const cy = Number(tokens[index + 1]);
      const ex = Number(tokens[index + 2]);
      const ey = Number(tokens[index + 3]);
      index += 4;
      if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(ex) || !Number.isFinite(ey)) return [];
      if (current !== undefined) {
        // Quadratic Bézier midpoint at t = 0.5 lies on the rounded elbow.
        out.push({
          x: 0.25 * current.x + 0.5 * cx + 0.25 * ex,
          y: 0.25 * current.y + 0.5 * cy + 0.25 * ey,
        });
      }
      current = { x: ex, y: ey };
      out.push(current);
    } else {
      break;
    }
  }
  return out;
}
