/**
 * Priority-matrix label placement (2x2 value/effort matrix).
 *
 * Pure TypeScript, no DOM. Given anchor points in frame pixels, label box
 * sizes and a plot frame, returns non-overlapping label positions with leader
 * lines back to their anchors. Deterministic: a fixed-seed PRNG drives the
 * simulated-annealing refinement (d3-labeler style energy), so repeated calls
 * with identical inputs return byte-identical outputs.
 *
 * Pipeline: greedy 8-candidate seeding around each anchor, then annealing over
 * overlap area + anchor distance + point-cover + out-of-frame penalties, with
 * hard clamping into the frame after every move.
 */

/** One matrix point in DATA space (0-100 per axis). */
export interface PriorityMatrixPoint {
  x: number;
  y: number;
  label: string;
}

/** Label box size in frame pixels (measured or estimated by the caller). */
export interface PriorityMatrixBox {
  w: number;
  h: number;
}

/** Plot frame in pixels: outer size plus inner plot margins. */
export interface PriorityMatrixFrame {
  width: number;
  height: number;
  marginLeft: number;
  marginTop: number;
  plotWidth: number;
  plotHeight: number;
}

/** Placed label: top-left box origin plus leader segment endpoints. */
export interface PriorityMatrixPlacement {
  /** Index into the input points array. */
  index: number;
  /** Top-left box origin, clamped inside the frame. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Anchor (point) position in frame pixels. */
  anchorX: number;
  anchorY: number;
  /** Leader line from box edge (x1,y1) to anchor (x2,y2). */
  leaderX1: number;
  leaderY1: number;
  leaderX2: number;
  leaderY2: number;
  /** Quadrant id of the datum. */
  quadrant: PriorityQuadrant;
}

export type PriorityQuadrant = 'quick-wins' | 'major-projects' | 'wait' | 'drop';

/**
 * Quadrant of a datum given thresholds (defaults 50/50).
 * x = complexity (low left), y = value (high top).
 */
export function priorityQuadrant(x: number, y: number, xThreshold = 50, yThreshold = 50): PriorityQuadrant {
  if (x < xThreshold && y >= yThreshold) return 'quick-wins';
  if (x >= xThreshold && y >= yThreshold) return 'major-projects';
  if (x < xThreshold && y < yThreshold) return 'wait';
  return 'drop';
}

/**
 * Rough box estimate from a label string when the caller has no measurement.
 * Single line up to 12 chars, two lines beyond; capped at 120px wide.
 */
export function estimatePriorityLabelBox(label: string): PriorityMatrixBox {
  const chars = [...label].length;
  if (chars === 0) return { w: 12, h: 20 };
  const lines = chars > 12 ? 2 : 1;
  const longest = lines === 2 ? Math.ceil(chars / 2) : chars;
  return { w: Math.min(120, 12 + 7 * longest), h: lines === 2 ? 34 : 20 };
}

export interface PlacePriorityLabelsOptions {
  xThreshold?: number;
  yThreshold?: number;
  /** Annealing iterations scale; default max(1500, n*120). */
  seed?: number;
}

const CANDIDATE_GAP = 8;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function overlapArea(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): number {
  const dx = Math.min(ax + aw, bx + bw) - Math.max(ax, bx);
  const dy = Math.min(ay + ah, by + bh) - Math.max(ay, by);
  return dx > 0 && dy > 0 ? dx * dy : 0;
}

function pointInBox(px: number, py: number, x: number, y: number, w: number, h: number, pad = 4): boolean {
  return px > x - pad && px < x + w + pad && py > y - pad && py < y + h + pad;
}

function clampInto(x: number, y: number, w: number, h: number, f: PriorityMatrixFrame): { x: number; y: number } {
  const minX = f.marginLeft;
  const minY = f.marginTop;
  const maxX = f.marginLeft + f.plotWidth - w;
  const maxY = f.marginTop + f.plotHeight - h;
  // Box wider/taller than the plot: pin to the origin instead of inverting.
  if (maxX < minX) return { x: minX, y: Math.min(Math.max(y, minY), Math.max(minY, f.marginTop + f.plotHeight - h)) };
  if (maxY < minY) return { x: Math.min(Math.max(x, minX), maxX), y: minY };
  return { x: Math.min(Math.max(x, minX), maxX), y: Math.min(Math.max(y, minY), maxY) };
}

/**
 * Place one label per point. Never throws on degenerate input: non-finite
 * coordinates fall back to the plot origin, empty arrays yield [].
 */
export function placePriorityLabels(
  points: readonly PriorityMatrixPoint[],
  boxes: readonly PriorityMatrixBox[],
  frame: PriorityMatrixFrame,
  opts: PlacePriorityLabelsOptions = {},
): PriorityMatrixPlacement[] {
  const xT = opts.xThreshold ?? 50;
  const yT = opts.yThreshold ?? 50;
  const seed = opts.seed ?? 42;
  const n = points.length;
  if (n === 0) return [];

  const anchors = points.map((p) => ({
    ax: Number.isFinite(p.x)
      ? frame.marginLeft + (Math.min(Math.max(p.x, 0), 100) / 100) * frame.plotWidth
      : frame.marginLeft,
    ay: Number.isFinite(p.y)
      ? frame.marginTop + (1 - Math.min(Math.max(p.y, 0), 100) / 100) * frame.plotHeight
      : frame.marginTop,
  }));
  const sizes = points.map((_, i) => {
    const b = boxes[i];
    const w = b && Number.isFinite(b.w) && b.w > 0 ? b.w : 12;
    const h = b && Number.isFinite(b.h) && b.h > 0 ? b.h : 20;
    return { w, h };
  });

  const offsets: ReadonlyArray<readonly [number, number]> = [
    [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1],
  ];

  const costAt = (idx: number, x: number, y: number, pos: Array<{ x: number; y: number }>): number => {
    let c = 0;
    const { w, h } = sizes[idx]!;
    const left = frame.marginLeft;
    const top = frame.marginTop;
    const right = left + frame.plotWidth;
    const bottom = top + frame.plotHeight;
    c += (Math.max(left - x, 0) + Math.max(x + w - right, 0) + Math.max(top - y, 0) + Math.max(y + h - bottom, 0)) * 400;
    for (let j = 0; j < n; j++) {
      if (j === idx || pos[j] === undefined) continue;
      c += overlapArea(x, y, w, h, pos[j]!.x, pos[j]!.y, sizes[j]!.w, sizes[j]!.h) * 2;
    }
    for (let j = 0; j < n; j++) {
      if (j === idx) continue;
      if (pointInBox(anchors[j]!.ax, anchors[j]!.ay, x, y, w, h)) c += 300;
    }
    c += Math.hypot(x + w / 2 - anchors[idx]!.ax, y + h / 2 - anchors[idx]!.ay) * 0.5;
    return c;
  };

  // Greedy seeding in stable y-then-x order.
  const order = points.map((_, i) => i).sort((a, b) => anchors[a]!.ay - anchors[b]!.ay || anchors[a]!.ax - anchors[b]!.ax);
  const pos: Array<{ x: number; y: number }> = new Array(n);
  for (const idx of order) {
    let bestX = anchors[idx]!.ax;
    let bestY = anchors[idx]!.ay;
    let bestC = Infinity;
    for (const [dx, dy] of offsets) {
      const cx = anchors[idx]!.ax + dx * (sizes[idx]!.w / 2 + CANDIDATE_GAP) - sizes[idx]!.w / 2;
      const cy = anchors[idx]!.ay + dy * (sizes[idx]!.h / 2 + CANDIDATE_GAP) - sizes[idx]!.h / 2;
      const cc = costAt(idx, cx, cy, pos);
      if (cc < bestC) {
        bestC = cc;
        bestX = cx;
        bestY = cy;
      }
    }
    const cl = clampInto(bestX, bestY, sizes[idx]!.w, sizes[idx]!.h, frame);
    pos[idx] = cl;
  }

  // Simulated-annealing refinement (fixed seed ⇒ deterministic).
  const rnd = mulberry32(seed);
  const energy = (): number => {
    let e = 0;
    for (let i = 0; i < n; i++) {
      const { w, h } = sizes[i]!;
      e += Math.hypot(pos[i]!.x + w / 2 - anchors[i]!.ax, pos[i]!.y + h / 2 - anchors[i]!.ay) * 0.6;
      if (
        pos[i]!.x < frame.marginLeft ||
        pos[i]!.y < frame.marginTop ||
        pos[i]!.x + w > frame.marginLeft + frame.plotWidth ||
        pos[i]!.y + h > frame.marginTop + frame.plotHeight
      ) {
        e += 5000;
      }
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        if (pointInBox(anchors[j]!.ax, anchors[j]!.ay, pos[i]!.x, pos[i]!.y, w, h)) e += 800;
      }
      for (let j = i + 1; j < n; j++) {
        e += overlapArea(pos[i]!.x, pos[i]!.y, w, h, pos[j]!.x, pos[j]!.y, sizes[j]!.w, sizes[j]!.h) * 3;
      }
    }
    return e;
  };
  let e = energy();
  let temp = 800;
  const iters = Math.max(1500, n * 120);
  const cool = Math.pow(1 / 800, 1 / iters);
  for (let k = 0; k < iters; k++) {
    const i = Math.floor(rnd() * n);
    const ox = pos[i]!.x;
    const oy = pos[i]!.y;
    const step = 6 + temp / 40;
    const cl = clampInto(pos[i]!.x + (rnd() * 2 - 1) * step, pos[i]!.y + (rnd() * 2 - 1) * step, sizes[i]!.w, sizes[i]!.h, frame);
    pos[i] = cl;
    const ne = energy();
    if (ne < e || rnd() < Math.exp((e - ne) / Math.max(temp, 1e-9))) {
      e = ne;
    } else {
      pos[i] = { x: ox, y: oy };
    }
    temp *= cool;
  }

  return points.map((p, i) => {
    const { w, h } = sizes[i]!;
    const bx = pos[i]!.x;
    const by = pos[i]!.y;
    // Leader from box edge midpoint nearest the anchor to the anchor.
    const cx = Math.min(Math.max(anchors[i]!.ax, bx), bx + w);
    const cy = Math.min(Math.max(anchors[i]!.ay, by), by + h);
    return {
      index: i,
      x: bx,
      y: by,
      w,
      h,
      anchorX: anchors[i]!.ax,
      anchorY: anchors[i]!.ay,
      leaderX1: cx,
      leaderY1: cy,
      leaderX2: anchors[i]!.ax,
      leaderY2: anchors[i]!.ay,
      quadrant: priorityQuadrant(p.x, p.y, xT, yT),
    };
  });
}
