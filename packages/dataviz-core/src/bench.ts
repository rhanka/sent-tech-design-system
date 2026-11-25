/**
 * Pure benchmark-chart presets and maths for PrecisionRecallChart,
 * ScoreCostChart, RankCurveChart, and AcceptanceRateChart.
 *
 * All functions are pure, locale-free, and deterministic.
 */

/** 2D axis domains for an iso-F1 curve in recall (x) × precision (y) space. */
export interface IsoF1Domain {
  readonly x: readonly [number, number];
  readonly y: readonly [number, number];
}

/** One 2D point on a curve in data space. */
export interface CurvePoint2D {
  readonly x: number;
  readonly y: number;
}

/**
 * Sample an iso-F1 curve `2 * p * r / (p + r) = level` clipped to `domain`.
 * Half of the samples are spaced evenly in recall (`x`), half in precision
 * (`y`), merged and sorted by `x` ascending so the steep branch near
 * `r -> level / 2` is not under-sampled.
 */
export function isoF1Curve(level: number, domain: IsoF1Domain, samples = 64): CurvePoint2D[] {
  if (!Number.isFinite(level) || level <= 0 || level >= 1) return [];
  const [xMin, xMax] = domain.x;
  const [yMin, yMax] = domain.y;
  if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || !Number.isFinite(yMin) || !Number.isFinite(yMax)) {
    return [];
  }
  if (xMax <= xMin || yMax <= yMin) return [];

  const halfF = level / 2;
  if (xMax <= halfF || yMax <= halfF) return [];

  const rFromYMax = (level * yMax) / (2 * yMax - level);
  const rFromYMin = yMin > halfF ? (level * yMin) / (2 * yMin - level) : xMax;

  const rLow = Math.max(xMin, rFromYMax);
  const rHigh = Math.min(xMax, rFromYMin);
  if (!(rLow < rHigh) || rHigh - rLow < 1e-12) return [];

  const pHigh = (level * rLow) / (2 * rLow - level);
  const pLow = (level * rHigh) / (2 * rHigh - level);

  const count = Math.max(4, Math.floor(samples));
  const recallCount = Math.max(2, Math.ceil(count / 2));
  const precisionCount = Math.max(2, count - recallCount);

  const raw: CurvePoint2D[] = [];
  for (let i = 0; i < recallCount; i += 1) {
    const t = recallCount === 1 ? 0 : i / (recallCount - 1);
    const r = rLow + t * (rHigh - rLow);
    const p = (level * r) / (2 * r - level);
    raw.push({ x: r, y: p });
  }
  for (let i = 0; i < precisionCount; i += 1) {
    const t = precisionCount === 1 ? 0 : i / (precisionCount - 1);
    const p = pLow + t * (pHigh - pLow);
    const r = (level * p) / (2 * p - level);
    raw.push({ x: r, y: p });
  }

  raw.sort((a, b) => a.x - b.x || b.y - a.y);

  const deduped: CurvePoint2D[] = [];
  for (const pt of raw) {
    const clamped: CurvePoint2D = {
      x: Math.min(xMax, Math.max(xMin, pt.x)),
      y: Math.min(yMax, Math.max(yMin, pt.y)),
    };
    const prev = deduped[deduped.length - 1];
    if (prev !== undefined && Math.abs(clamped.x - prev.x) < 1e-12 && Math.abs(clamped.y - prev.y) < 1e-12) {
      continue;
    }
    deduped.push(clamped);
  }
  return deduped;
}

/** Options naming the minimized (x) and maximized (y) numeric properties. */
export interface ParetoFrontierOptions<K extends string> {
  readonly minimize: K;
  readonly maximize: K;
}

/** Frontier point ids ordered by cost ascending and axis-aligned step points. */
export interface ParetoFrontierResult {
  readonly ids: string[];
  readonly steps: CurvePoint2D[];
}

/**
 * Compute the Pareto frontier (minimize x, maximize y) and its axis-aligned
 * staircase step points (`(x_i, y_i) -> (x_{i+1}, y_i) -> (x_{i+1}, y_{i+1})`).
 * Ties with identical `(x, y)` are all kept on the frontier (ordered by `id`).
 */
export function paretoFrontier<
  K extends string,
  T extends { readonly id: string } & Record<K, number>,
>(points: readonly T[], options: ParetoFrontierOptions<K>): ParetoFrontierResult {
  if (points.length === 0) return { ids: [], steps: [] };

  const sorted = [...points].sort((a, b) => {
    const ax = a[options.minimize];
    const bx = b[options.minimize];
    if (ax !== bx) return ax - bx;
    const ay = a[options.maximize];
    const by = b[options.maximize];
    if (ay !== by) return by - ay;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  const ids: string[] = [];
  const frontierCoords: CurvePoint2D[] = [];
  let bestY = -Infinity;
  let lastFrontierX = NaN;
  let lastFrontierY = NaN;

  for (const pt of sorted) {
    const x = pt[options.minimize];
    const y = pt[options.maximize];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

    if (y > bestY) {
      ids.push(pt.id);
      frontierCoords.push({ x, y });
      bestY = y;
      lastFrontierX = x;
      lastFrontierY = y;
    } else if (x === lastFrontierX && y === lastFrontierY) {
      // Exact coordinate duplicate of a frontier point is also non-dominated.
      ids.push(pt.id);
    }
  }

  const steps: CurvePoint2D[] = [];
  for (let i = 0; i < frontierCoords.length; i += 1) {
    const curr = frontierCoords[i]!;
    if (i > 0) {
      const prev = frontierCoords[i - 1]!;
      steps.push({ x: curr.x, y: prev.y });
    }
    steps.push({ x: curr.x, y: curr.y });
  }

  return { ids, steps };
}

/** X-axis mode for a rank curve. */
export type RankCurveAxis = 'rank' | 'percent';

/** Options for `buildRankCurve`. */
export interface RankCurveOptions {
  readonly axis?: RankCurveAxis;
}

/** One point of a sorted rank curve. */
export interface RankCurvePoint {
  readonly x: number;
  readonly y: number;
  readonly rank: number;
  readonly sourceIndex: number;
}

/** Summary statistics computed by linear interpolation (`pos = q * (n - 1)`). */
export interface RankCurveSummary {
  readonly n: number;
  readonly mean: number;
  readonly min: number;
  readonly p10: number;
  readonly median: number;
  readonly p90: number;
  readonly max: number;
  readonly zeroCount: number;
}

/** X-axis interval covering trailing zero values, or `null` when none exist. */
export interface RankCurveZeroBand {
  readonly from: number;
  readonly to: number;
  readonly count: number;
}

/** Complete rank-curve model returned by `buildRankCurve`. */
export interface RankCurveModel {
  readonly axis: RankCurveAxis;
  readonly points: RankCurvePoint[];
  readonly summary: RankCurveSummary;
  readonly zeroBand: RankCurveZeroBand | null;
}

function linearQuantileAscending(sortedAsc: readonly number[], q: number): number {
  const n = sortedAsc.length;
  if (n === 0) return 0;
  if (n === 1) return sortedAsc[0]!;
  const pos = q * (n - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  const frac = pos - lo;
  return sortedAsc[lo]! * (1 - frac) + sortedAsc[hi]! * frac;
}

/**
 * Sort `values` descending (stable on ties), assign ranks `1..n` (or `rank / n`),
 * and compute summary quantiles by linear interpolation (`pos = q * (n - 1)`).
 */
export function buildRankCurve(values: readonly number[], options: RankCurveOptions = {}): RankCurveModel {
  const axis: RankCurveAxis = options.axis ?? 'rank';
  const n = values.length;
  if (n === 0) {
    return {
      axis,
      points: [],
      summary: { n: 0, mean: 0, min: 0, p10: 0, median: 0, p90: 0, max: 0, zeroCount: 0 },
      zeroBand: null,
    };
  }

  const indexed = values.map((value, index) => ({ value, index }));
  indexed.sort((a, b) => b.value - a.value || a.index - b.index);

  let sum = 0;
  let zeroCount = 0;
  let firstZeroRank = -1;
  const points: RankCurvePoint[] = indexed.map((entry, idx) => {
    const rank = idx + 1;
    sum += entry.value;
    if (entry.value === 0) {
      zeroCount += 1;
      if (firstZeroRank === -1) firstZeroRank = rank;
    }
    return {
      x: axis === 'percent' ? rank / n : rank,
      y: entry.value,
      rank,
      sourceIndex: entry.index,
    };
  });

  const asc = [...indexed].reverse().map((entry) => entry.value);
  const summary: RankCurveSummary = {
    n,
    mean: sum / n,
    min: asc[0]!,
    p10: linearQuantileAscending(asc, 0.1),
    median: linearQuantileAscending(asc, 0.5),
    p90: linearQuantileAscending(asc, 0.9),
    max: asc[n - 1]!,
    zeroCount,
  };

  const zeroBand: RankCurveZeroBand | null =
    zeroCount > 0 && firstZeroRank !== -1
      ? {
          from: axis === 'percent' ? firstZeroRank / n : firstZeroRank,
          to: axis === 'percent' ? 1 : n,
          count: zeroCount,
        }
      : null;

  return { axis, points, summary, zeroBand };
}

/** Input item for `buildAcceptanceRates`. */
export interface AcceptanceRateInput {
  readonly id: string;
  readonly label: string;
  readonly accepted: number;
  readonly total: number;
}

/** Row ordering mode for `buildAcceptanceRates`. */
export type AcceptanceRateOrder = 'given' | 'rate';

/** Options for `buildAcceptanceRates`. */
export interface AcceptanceRateOptions {
  readonly order?: AcceptanceRateOrder;
}

/** Computed row with rate, printed percentage, and 95 % Wilson interval. */
export interface AcceptanceRateRow {
  readonly id: string;
  readonly label: string;
  readonly accepted: number;
  readonly total: number;
  readonly rate: number;
  readonly percentText: string;
  readonly valueText: string;
  readonly interval: readonly [number, number];
}

// Two-sided 95% normal quantile Phi^{-1}(0.975).
const WILSON_Z_95 = 1.959963984540054;

/** Round `value` to `decimals` decimal places with half-even tie breaking. */
function roundHalfEvenFixed(value: number, decimals: number): string {
  const factor = Math.pow(10, decimals);
  const scaled = value * factor;
  const floor = Math.floor(scaled);
  const frac = scaled - floor;
  let rounded: number;
  if (Math.abs(frac - 0.5) < 1e-12) {
    rounded = floor % 2 === 0 ? floor : floor + 1;
  } else {
    rounded = Math.round(scaled);
  }
  return (rounded / factor).toFixed(decimals);
}

/**
 * Compute Wilson 95 % confidence interval for `accepted / total`.
 */
export function wilsonInterval95(accepted: number, total: number): readonly [number, number] {
  if (total <= 0) return [0, 1];
  const p = accepted / total;
  const z2 = WILSON_Z_95 * WILSON_Z_95;
  const denom = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denom;
  const half = (WILSON_Z_95 * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denom;
  const lower = accepted === 0 ? 0 : Math.max(0, center - half);
  const upper = accepted === total ? 1 : Math.min(1, center + half);
  return [lower, upper];
}

/**
 * Derive acceptance rates, printed percentage labels (`82.5 % (330/400)`),
 * and 95 % Wilson confidence intervals.
 */
export function buildAcceptanceRates(
  items: readonly AcceptanceRateInput[],
  options: AcceptanceRateOptions = {},
): AcceptanceRateRow[] {
  const order: AcceptanceRateOrder = options.order ?? 'given';
  const indexed = items.map((item, index) => {
    const rate = item.total > 0 ? item.accepted / item.total : 0;
    const percentText = `${roundHalfEvenFixed(rate * 100, 1)} %`;
    const valueText = `${percentText} (${item.accepted}/${item.total})`;
    const interval = wilsonInterval95(item.accepted, item.total);
    return {
      index,
      row: {
        id: item.id,
        label: item.label,
        accepted: item.accepted,
        total: item.total,
        rate,
        percentText,
        valueText,
        interval,
      } satisfies AcceptanceRateRow,
    };
  });

  if (order === 'rate') {
    indexed.sort((a, b) => b.row.rate - a.row.rate || a.index - b.index);
  }

  return indexed.map((entry) => entry.row);
}

/** Allowed direct-label positions around a scatter point. */
export type PointLabelPosition = 'top' | 'right' | 'bottom' | 'left';

/** Point coordinate and optional marker radius in plot pixels. */
export interface PointLabelAnchor {
  readonly x: number;
  readonly y: number;
  readonly r?: number;
}

/** Estimated label bounding box in pixels. */
export interface PointLabelBox {
  readonly w: number;
  readonly h: number;
}

/** Plot area in pixels for boundary collision checks. */
export interface PointLabelPlot {
  readonly x?: number;
  readonly y?: number;
  readonly width: number;
  readonly height: number;
  readonly gap?: number;
  readonly padding?: number;
}

interface PlacedRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

const CANDIDATE_POSITIONS: readonly PointLabelPosition[] = ['top', 'right', 'bottom', 'left'];

function candidateRect(
  anchor: PointLabelAnchor,
  box: PointLabelBox,
  pos: PointLabelPosition,
  gap: number,
): PlacedRect {
  const r = anchor.r ?? 4;
  switch (pos) {
    case 'top':
      return { x: anchor.x - box.w / 2, y: anchor.y - r - gap - box.h, w: box.w, h: box.h };
    case 'right':
      return { x: anchor.x + r + gap, y: anchor.y - box.h / 2, w: box.w, h: box.h };
    case 'bottom':
      return { x: anchor.x - box.w / 2, y: anchor.y + r + gap, w: box.w, h: box.h };
    case 'left':
      return { x: anchor.x - r - gap - box.w, y: anchor.y - box.h / 2, w: box.w, h: box.h };
  }
}

function rectsOverlap(a: PlacedRect, b: PlacedRect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function rectOverlapsPoint(rect: PlacedRect, pt: PointLabelAnchor): boolean {
  const r = (pt.r ?? 4) + 1;
  const cx = Math.min(Math.max(pt.x, rect.x), rect.x + rect.w);
  const cy = Math.min(Math.max(pt.y, rect.y), rect.y + rect.h);
  return Math.hypot(pt.x - cx, pt.y - cy) < r;
}

/**
 * Deterministic all-or-nothing collision test for scatter point direct labels.
 * Tries `["top", "right", "bottom", "left"]` in order for each point and
 * returns `null` as soon as any point cannot be placed without overlapping plot
 * edges, any point marker, or any already-placed label box.
 */
export function placePointLabels(
  points: readonly PointLabelAnchor[],
  boxes: readonly PointLabelBox[],
  plot: PointLabelPlot,
): PointLabelPosition[] | null {
  if (points.length === 0) return [];
  if (boxes.length !== points.length) return null;
  if (!Number.isFinite(plot.width) || !Number.isFinite(plot.height) || plot.width <= 0 || plot.height <= 0) {
    return null;
  }

  const plotX = plot.x ?? 0;
  const plotY = plot.y ?? 0;
  const pad = plot.padding ?? 2;
  const gap = plot.gap ?? 6;
  const minX = plotX + pad;
  const minY = plotY + pad;
  const maxX = plotX + plot.width - pad;
  const maxY = plotY + plot.height - pad;

  const placedRects: PlacedRect[] = [];
  const positions: PointLabelPosition[] = [];

  for (let i = 0; i < points.length; i += 1) {
    const pt = points[i]!;
    const box = boxes[i]!;
    if (
      !Number.isFinite(pt.x) ||
      !Number.isFinite(pt.y) ||
      !Number.isFinite(box.w) ||
      !Number.isFinite(box.h) ||
      box.w <= 0 ||
      box.h <= 0
    ) {
      return null;
    }

    let chosen: PointLabelPosition | undefined;
    let chosenRect: PlacedRect | undefined;

    for (const pos of CANDIDATE_POSITIONS) {
      const rect = candidateRect(pt, box, pos, gap);
      if (rect.x < minX || rect.y < minY || rect.x + rect.w > maxX || rect.y + rect.h > maxY) continue;
      if (points.some((other) => rectOverlapsPoint(rect, other))) continue;
      if (placedRects.some((prev) => rectsOverlap(rect, prev))) continue;
      chosen = pos;
      chosenRect = rect;
      break;
    }

    if (chosen === undefined || chosenRect === undefined) return null;
    positions.push(chosen);
    placedRects.push(chosenRect);
  }

  return positions;
}

// Fixed normalized per-character width table at 11 px font size (independent of
// loaded system fonts so collision outcomes are identical across machines).
const NARROW_CHARS = new Set([...'ijlItf1.,:;|!()[]{}\'"` ']);
const WIDE_CHARS = new Set([...'mwMWGOQD@%&#']);

/**
 * Estimate a label bounding box deterministically using a fixed per-character
 * width table (independent of whatever font the host actually loads).
 */
export function estimateBenchLabelBox(text: string, fontSize = 11): PointLabelBox {
  const scale = fontSize / 11;
  let width = 4;
  for (const ch of text) {
    if (NARROW_CHARS.has(ch)) width += 3.6;
    else if (WIDE_CHARS.has(ch)) width += 9.2;
    else if (ch >= 'A' && ch <= 'Z') width += 7.4;
    else if (ch >= '0' && ch <= '9') width += 6.4;
    else width += 6.0;
  }
  return {
    w: Math.ceil(width * scale),
    h: Math.ceil(14 * scale),
  };
}
