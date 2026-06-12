<script lang="ts" module>
  export type LineChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type LineChartDatum = {
    x: number | string;
    y: number;
    /**
     * Marks the datum as a FORECAST point. Forecast points render with the
     * dedicated forecast tone and every segment touching a forecast point is
     * dashed — including the segment between the last actual point and the
     * first forecast point, so the line stays connected. Absent/false ⇒
     * rendering unchanged (additive).
     */
    forecast?: boolean;
  };

  /**
   * Semantic tone for an analytical overlay (reference line / band / goal).
   * Maps to the feedback token family — markers, not categorical series.
   */
  export type ChartOverlayTone = "neutral" | "success" | "warning" | "error" | "info";

  export type ChartReferenceLine = {
    value: number;
    label?: string;
    tone?: ChartOverlayTone;
    axis?: "x" | "y";
  };

  export type ChartBand = {
    from: number;
    to: number;
    label?: string;
    tone?: ChartOverlayTone;
  };

  export type ChartGoalLine = {
    value: number;
    label?: string;
  };

  /** Value-axis scale type. `log` requires strictly positive values. */
  export type ChartScale = "linear" | "log";
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import {
    resolveAnnotations,
    annotationDataListItems,
    polygonPoints,
    type ChartAnnotation
  } from "./chartAnnotations.js";
  import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";
  import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";
  import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

  type LineChartProps = {
    data: LineChartDatum[];
    width?: number;
    height?: number;
    tone?: LineChartTone;
    smooth?: boolean;
    area?: boolean;
    label: string;
    /** Reference lines (default `axis: "y"` → horizontal at `value`). */
    referenceLines?: ChartReferenceLine[];
    /** Shaded value-axis bands between `from`..`to`. */
    bands?: ChartBand[];
    /** A single goal line, emphasised above the data. */
    goalLine?: ChartGoalLine;
    /** Least-squares trend line over the data points. */
    trend?: boolean;
    /**
     * Annotation overlay in DATA space (points, labels, axis lines, regions,
     * polygons). Resolved to pixels via the chart's scales and drawn in a
     * dedicated `<g class="st-lineChart__annotations">` — regions behind the
     * series, every other kind above it. Additive: absent ⇒ unchanged.
     */
    annotations?: ChartAnnotation[];
    /**
     * Per-point value labels. `false`/absent (default) → none. `true` → each
     * point's value with the chart's numeric formatter. Object → `format(value)`
     * and/or a `position` override. Default position is `top` (above the point).
     * Labels are `aria-hidden` — the values already live in the accessible
     * ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    /**
     * Fixed value-axis (y) domain `[min, max]`. When provided (and finite,
     * min<max) the y scale uses it instead of the data-derived range — letting
     * several LineCharts share one scale. Invalid/absent → auto range (unchanged).
     */
    domain?: [number, number];
    /**
     * Value-axis scale. `"linear"` (default) is unchanged. `"log"` switches the
     * y axis to base-10 logarithmic — values `<= 0` are ignored for domain/ticks
     * and clamped to the lowest tick when positioned.
     */
    scale?: ChartScale;
    /** Inverts the value (y) axis. Default false. */
    invertAxis?: boolean;
    /**
     * Toggles the legend if the chart has one. LineChart is single-series and has
     * no legend surface, so this prop is accepted for parity and otherwise ignored.
     */
    showLegend?: boolean;
    /**
     * CONTROLLED synchronised hover key (FR-3). A datum's key is `String(x)`. When
     * provided (string or null), the crosshair + tooltip track this key instead of
     * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
     * share one hover channel across several aligned charts. Absent (`undefined`)
     * keeps the legacy uncontrolled behaviour.
     */
    hoverKey?: string | null;
    /**
     * Emitted when the user hovers a datum (its key) or leaves the plot (`null`).
     * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
     * keep the shared hover channel in sync.
     */
    onHoverKeyChange?: (key: string | null) => void;
    /**
     * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
     * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
     * over the points: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
     * points (data order), Home/End jump to the first/last, Enter/Space select the
     * focused point (`onSelectKey`), Escape leaves the navigation. Each focused
     * point announces its `x` + value. Absent ⇒ no overlay, rendering unchanged.
     */
    keyboardNav?: boolean;
    /**
     * Emitted when the user selects the focused point via Enter/Space (its key,
     * `String(x)`), or `null` when the navigation is left via Escape. Wiring it
     * also turns the keyboard navigation on.
     */
    onSelectKey?: (key: string | null) => void;
    class?: string;
  };

  let {
    data,
    width = 480,
    height = 240,
    tone = "category1",
    smooth = false,
    area = false,
    label,
    referenceLines,
    bands,
    goalLine,
    trend = false,
    annotations,
    dataLabels,
    domain,
    scale = "linear",
    invertAxis = false,
    showLegend,
    hoverKey,
    onHoverKeyChange,
    keyboardNav,
    onSelectKey,
    class: className
  }: LineChartProps = $props();

  // LineChart is single-series and has no legend surface; `showLegend` is part
  // of the contract for cross-chart parity and is a deliberate no-op here.
  // Intentionally destructured-but-unused.

  const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

  function niceTicks(min: number, max: number, target = 5): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      const base = Number.isFinite(max) ? max : 0;
      return [base];
    }
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let step: number;
    if (norm < 1.5) step = 1 * pow;
    else if (norm < 3) step = 2 * pow;
    else if (norm < 7) step = 5 * pow;
    else step = 10 * pow;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= end + step / 2; v += step) {
      ticks.push(Number(v.toFixed(10)));
    }
    return ticks;
  }

  const uniqueSortedTicks = (values: number[]) =>
    Array.from(new Set(values.filter(Number.isFinite).map((v) => Number(v.toFixed(10))))).sort((a, b) => a - b);

  function fixedTicks(min: number, max: number, target = 5): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return niceTicks(min, max, target);
    return uniqueSortedTicks([min, ...niceTicks(min, max, target).filter((tick) => tick > min && tick < max), max]);
  }

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  // Lowest strictly-positive value among the args; floor for a log domain.
  function smallestPositive(...vals: number[]): number {
    let lo = Infinity;
    for (const v of vals) if (Number.isFinite(v) && v > 0 && v < lo) lo = v;
    return Number.isFinite(lo) ? lo : 1;
  }

  // Power-of-ten ticks spanning [min, max] for a log axis.
  function logTicks(min: number, max: number): number[] {
    const lo = min > 0 ? min : 1;
    const hi = max > lo ? max : lo * 10;
    const startExp = Math.floor(Math.log10(lo));
    const endExp = Math.ceil(Math.log10(hi));
    const ticks: number[] = [];
    for (let e = startExp; e <= endExp; e++) ticks.push(Number(Math.pow(10, e).toFixed(10)));
    return ticks.length ? ticks : [lo];
  }

  function fixedLogTicks(min: number, max: number): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || min >= max) return logTicks(min, max);
    return uniqueSortedTicks([min, ...logTicks(min, max).filter((tick) => tick > min && tick < max), max]);
  }

  function validLinearDomainCandidate(value: [number, number] | undefined): [number, number] | null {
    return value && Number.isFinite(value[0]) && Number.isFinite(value[1]) && value[0] < value[1] ? value : null;
  }

  function validLogDomainCandidate(value: [number, number] | undefined): [number, number] | null {
    return value && Number.isFinite(value[0]) && Number.isFinite(value[1]) && value[0] > 0 && value[0] < value[1]
      ? value
      : null;
  }

  function clampFraction(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
  }

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  function isNumeric(x: number | string): x is number {
    return typeof x === "number" && Number.isFinite(x);
  }

  // --- Analytical overlay helpers (inline; parity with chartScale) ----------
  function overlayToneClass(prefix: string, t: ChartOverlayTone | undefined): string {
    return `${prefix}--${t ?? "neutral"}`;
  }

  function linearRegression(
    pts: { x: number; y: number }[]
  ): { slope: number; intercept: number; minX: number; maxX: number } | null {
    const finite = pts.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (finite.length < 2) return null;
    const n = finite.length;
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let sxy = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    for (const p of finite) {
      sx += p.x;
      sy += p.y;
      sxx += p.x * p.x;
      sxy += p.x * p.y;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
    }
    const denom = n * sxx - sx * sx;
    if (denom === 0) return null;
    const slope = (n * sxy - sx * sy) / denom;
    const intercept = (sy - slope * sx) / n;
    if (!Number.isFinite(slope) || !Number.isFinite(intercept)) return null;
    return { slope, intercept, minX, maxX };
  }

  function extendValueDomain(
    minV: number,
    maxV: number,
    refs: ChartReferenceLine[] | undefined,
    bnds: ChartBand[] | undefined,
    goal: ChartGoalLine | null
  ): [number, number] {
    let lo = minV;
    let hi = maxV;
    const fold = (v: number | undefined) => {
      if (v === undefined || !Number.isFinite(v)) return;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    };
    for (const r of refs ?? []) if ((r.axis ?? "y") === "y") fold(r.value);
    for (const b of bnds ?? []) {
      fold(b.from);
      fold(b.to);
    }
    if (goal) fold(goal.value);
    return [lo, hi];
  }

  function overlayDataListItems(
    refs: ChartReferenceLine[] | undefined,
    bnds: ChartBand[] | undefined,
    goal: ChartGoalLine | null,
    trendModel: { slope: number } | null
  ): string[] {
    const items: string[] = [];
    for (const r of refs ?? []) {
      if (!Number.isFinite(r.value)) continue;
      items.push(r.label ? `Référence: ${r.label} = ${r.value}` : `Référence: ${r.value}`);
    }
    for (const b of bnds ?? []) {
      if (!Number.isFinite(b.from) || !Number.isFinite(b.to)) continue;
      const lo = Math.min(b.from, b.to);
      const hi = Math.max(b.from, b.to);
      items.push(b.label ? `Bande: ${b.label} (${lo}–${hi})` : `Bande: ${lo}–${hi}`);
    }
    if (goal && Number.isFinite(goal.value)) {
      items.push(goal.label ? `Objectif: ${goal.label} = ${goal.value}` : `Objectif: ${goal.value}`);
    }
    if (trendModel) items.push(`Tendance: pente ${trendModel.slope.toFixed(2)}`);
    return items;
  }

  let hoveredIndex: number | null = $state(null);
  // FR-5 — roving keyboard focus over the data points (separate from hover).
  let focusedIndex: number = $state(-1);
  let datapointRefs: Array<SVGRectElement | null> = [];

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const xDomain = $derived.by(() => {
    if (data.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = data.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = data.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: data.map((d) => d.x) };
  });

  // A valid goal line needs a finite value; otherwise it is ignored entirely.
  const goal = $derived(goalLine && Number.isFinite(goalLine.value) ? goalLine : null);

  const isLog = $derived(scale === "log");

  // A y domain is honoured only when both bounds are finite and ordered (min<max).
  const validDomain = $derived.by<[number, number] | null>(() => {
    return isLog ? validLogDomainCandidate(domain) : validLinearDomainCandidate(domain);
  });

  const yTicks = $derived.by(() => {
    const ys = data.map((d) => d.y).filter((y) => Number.isFinite(y));
    if (isLog) {
      const posOverlays = [
        ...(referenceLines ?? []).filter((r) => (r.axis ?? "y") === "y").map((r) => r.value),
        ...(bands ?? []).flatMap((b) => [b.from, b.to]),
        ...(goal ? [goal.value] : [])
      ];
      let lo: number;
      let hi: number;
      if (validDomain) {
        lo = validDomain[0];
        hi = validDomain[1];
      } else {
        lo = smallestPositive(...ys, ...posOverlays);
        hi = Math.max(lo, ...ys.filter((y) => y > 0), ...posOverlays.filter((v) => v > 0));
      }
      return validDomain ? fixedLogTicks(lo, hi) : logTicks(lo, hi);
    }
    if (validDomain) return fixedTicks(validDomain[0], validDomain[1], 5);
    if (ys.length === 0 && !referenceLines?.length && !bands?.length && !goal) return [0];
    let minRaw = ys.length ? Math.min(...ys) : 0;
    let maxRaw = ys.length ? Math.max(...ys) : 0;
    // Fold overlay values into the domain so they never fall outside the plot.
    [minRaw, maxRaw] = extendValueDomain(minRaw, maxRaw, referenceLines, bands, goal);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  });

  const yDomain = $derived.by(() => {
    if (yTicks.length === 0) return { min: 0, max: 1 };
    return { min: yTicks[0], max: yTicks[yTicks.length - 1] };
  });

  // Maps a y value to a fraction in [0,1] (0 = yDomain.min, 1 = yDomain.max),
  // honouring log scale + axis inversion. Linear + no invert is unchanged.
  const valueFraction = $derived((v: number) => {
    let f: number;
    if (isLog) {
      const lo = Math.log10(yDomain.min);
      const hi = Math.log10(yDomain.max);
      const clamped = v > 0 ? v : yDomain.min;
      f = hi === lo ? 0 : (Math.log10(clamped) - lo) / (hi - lo);
    } else {
      f = yDomain.max === yDomain.min ? 0 : (v - yDomain.min) / (yDomain.max - yDomain.min);
    }
    return clampFraction(invertAxis ? 1 - f : f);
  });

  // Pixel y for a value (top of plot = fraction 1). Relative to plot, add MARGIN.top.
  const yPixel = $derived((v: number) => plotHeight * (1 - valueFraction(v)));

  const points = $derived.by(() => {
    if (data.length === 0) return [];
    return data.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        // ordinal: distribute evenly
        const denom = Math.max(data.length - 1, 1);
        x = data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const y = yPixel(d.y);
      return {
        x: MARGIN.left + x,
        y: MARGIN.top + y,
        datum: d,
        index: i
      };
    });
  });

  // --- Analytical overlays --------------------------------------------------
  // All overlays live in the chart's coordinate space, below the data series
  // (the goal line is the single exception, drawn above for emphasis).
  const bandRects = $derived(
    (bands ?? [])
      .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
      .map((b, i) => {
        const y1 = MARGIN.top + yPixel(b.from);
        const y2 = MARGIN.top + yPixel(b.to);
        return {
          key: i,
          x: MARGIN.left,
          y: Math.min(y1, y2),
          width: plotWidth,
          height: Math.max(Math.abs(y2 - y1), 0.5),
          label: b.label,
          tone: b.tone
        };
      })
  );

  const refLines = $derived(
    (referenceLines ?? [])
      .filter((r) => Number.isFinite(r.value))
      .map((r, i) => {
        const axis = r.axis ?? "y";
        if (axis === "x") {
          if (xDomain.kind !== "numeric") return null;
          const x = MARGIN.left + scaleLinear(r.value, xDomain.min, xDomain.max, 0, plotWidth);
          return { key: i, axis, x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + plotHeight, label: r.label, tone: r.tone };
        }
        const y = MARGIN.top + yPixel(r.value);
        return { key: i, axis, x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: y, y2: y, label: r.label, tone: r.tone };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
  );

  const goalGeom = $derived(
    goal
      ? {
          y: MARGIN.top + yPixel(goal.value),
          label: goal.label,
          value: goal.value
        }
      : null
  );

  const trendModel = $derived(
    trend && xDomain.kind === "numeric"
      ? linearRegression(data.map((d) => ({ x: d.x as number, y: d.y })))
      : null
  );
  const trendLine = $derived.by(() => {
    if (!trendModel || xDomain.kind !== "numeric") return null;
    return {
      x1: MARGIN.left + scaleLinear(trendModel.minX, xDomain.min, xDomain.max, 0, plotWidth),
      y1: MARGIN.top + yPixel(trendModel.slope * trendModel.minX + trendModel.intercept),
      x2: MARGIN.left + scaleLinear(trendModel.maxX, xDomain.min, xDomain.max, 0, plotWidth),
      y2: MARGIN.top + yPixel(trendModel.slope * trendModel.maxX + trendModel.intercept)
    };
  });

  // --- Annotation overlay ---------------------------------------------------
  // Data-space annotations resolved to absolute pixels via the chart scales.
  // `xScale` honours the ordinal/numeric x domain (a category matches by
  // equality, a numeric value must sit inside the domain); `yScale` reuses the
  // value fraction. Out-of-domain coordinates yield `null` → the resolver drops
  // them, so an annotation never escapes the plot.
  const annotationXScale = $derived((v: number | string): number | null => {
    if (xDomain.kind === "numeric") {
      if (typeof v !== "number" || !Number.isFinite(v)) return null;
      if (v < xDomain.min || v > xDomain.max) return null;
      return scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth);
    }
    const i = data.findIndex((d) => d.x === v);
    if (i < 0) return null;
    const denom = Math.max(data.length - 1, 1);
    return data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
  });
  const annotationYScale = $derived((v: number): number | null => {
    if (!Number.isFinite(v)) return null;
    return plotHeight * (1 - valueFraction(v));
  });
  const resolvedAnnotations = $derived(
    resolveAnnotations(annotations, {
      xScale: annotationXScale,
      yScale: annotationYScale,
      plotLeft: MARGIN.left,
      plotTop: MARGIN.top,
      plotWidth,
      plotHeight
    })
  );
  const annotationRegions = $derived(resolvedAnnotations.filter((a) => a.kind === "region"));
  const annotationAbove = $derived(resolvedAnnotations.filter((a) => a.kind !== "region"));

  // --- Data labels ----------------------------------------------------------
  // One value label per point. Default `top`: just above the dot. `center` sits
  // on the dot. aria-hidden (values are in the ChartDataList already).
  const dataLabelOpts = $derived(normalizeDataLabels(dataLabels));
  const dataLabelItems = $derived.by(() => {
    if (!dataLabelOpts.enabled) return [] as { key: number; x: number; y: number; text: string; baseline: string }[];
    return points.map((p) => {
      const text = formatDataLabel(p.datum.y, dataLabelOpts, formatTick);
      const center = dataLabelOpts.position === "center" || dataLabelOpts.position === "inside";
      return { key: p.index, x: p.x, y: center ? p.y : p.y - 8, text, baseline: center ? "middle" : "auto" };
    });
  });

  // --- Forecast segments ------------------------------------------------------
  // A datum with `forecast: true` renders as a forecast point: its dot takes
  // the forecast tone and every segment touching a forecast point is dashed,
  // so the actual→forecast transition stays connected. Without any forecast
  // datum the single solid path below is identical to before (additive).
  const forecastFlags = $derived(data.map((d) => d.forecast === true));
  const hasForecast = $derived(forecastFlags.some(Boolean));

  // Maximal runs of consecutive segments sharing the same (solid/dashed) kind;
  // `start`/`end` are inclusive point indices. A segment between two
  // consecutive points is dashed when EITHER endpoint is a forecast datum.
  type ForecastRun = { start: number; end: number; forecast: boolean };
  function forecastRuns(flags: boolean[]): ForecastRun[] {
    const runs: ForecastRun[] = [];
    for (let i = 0; i < flags.length - 1; i++) {
      const dashed = Boolean(flags[i] || flags[i + 1]);
      const last = runs[runs.length - 1];
      if (last && last.forecast === dashed) last.end = i + 1;
      else runs.push({ start: i, end: i + 1, forecast: dashed });
    }
    return runs;
  }

  const dataValueItems = $derived([
    ...data.map((d, i) => (forecastFlags[i] ? `${d.x}: ${d.y} (prévision)` : `${d.x}: ${d.y}`)),
    ...overlayDataListItems(referenceLines, bands, goal, trendModel),
    ...annotationDataListItems(annotations)
  ]);

  function buildLinearPath(pts: { x: number; y: number }[]): string {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  }

  function buildSmoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return buildLinearPath(pts);
    const t = 0.18;
    let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = p1.y + (p2.y - p0.y) * t;
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = p2.y - (p3.y - p1.y) * t;
      d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }

  // Full-series path (area fill always covers the whole series).
  const fullLinePath = $derived(
    points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points)
  );

  // Solid (actual) + dashed (forecast) sub-paths. Without any forecast datum
  // the solid list is exactly [fullLinePath] — the previous single path.
  const segmentPath = $derived((run: ForecastRun) => {
    const seg = points.slice(run.start, run.end + 1);
    return smooth ? buildSmoothPath(seg) : buildLinearPath(seg);
  });
  const runs = $derived(hasForecast ? forecastRuns(forecastFlags) : []);
  const solidPaths = $derived.by(() => {
    if (!hasForecast) return fullLinePath ? [fullLinePath] : [];
    return runs.filter((r) => !r.forecast).map(segmentPath);
  });
  const forecastPaths = $derived(runs.filter((r) => r.forecast).map(segmentPath));

  const areaPath = $derived.by(() => {
    if (!area || points.length === 0) return "";
    const base = MARGIN.top + plotHeight;
    const first = points[0];
    const last = points[points.length - 1];
    return `${fullLinePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  });

  const gridLines = $derived(
    yTicks.map((tick) => ({
      value: tick,
      y: MARGIN.top + yPixel(tick)
    }))
  );

  const xTickEntries = $derived.by(() => {
    if (data.length === 0) return [];
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({
        x: p.x,
        label: String(data[i].x)
      }));
    }
    const target = Math.min(5, data.length);
    const stride = Math.max(1, Math.round((data.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < data.length; i += stride) {
      entries.push({ x: points[i].x, label: String(data[i].x) });
    }
    const lastIdx = data.length - 1;
    if (entries[entries.length - 1]?.label !== String(data[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(data[lastIdx].x) });
    }
    return entries;
  });

  // Stable key per datum (FR-3): `String(x)`. Resolves a controlled `hoverKey`
  // to an index and feeds `onHoverKeyChange` from pointer events.
  const hoverKeys = $derived(data.map((d) => keyForX(d.x)));
  function emitHoverKey(index: number | null) {
    onHoverKeyChange?.(index == null ? null : hoverKeys[index] ?? null);
  }
  function handleLeave() {
    hoveredIndex = null;
    emitHoverKey(null);
  }
  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      emitHoverKey(null);
      return;
    }
    const raw = Number(target.getAttribute("data-chart-index"));
    const index = Number.isInteger(raw) ? raw : null;
    hoveredIndex = index;
    emitHoverKey(index);
  }

  // Index whose crosshair/tooltip is DISPLAYED: the controlled `hoverKey` when
  // provided (resolved against `hoverKeys`), else the internal pointer index.
  const activeIndex = $derived(resolveActiveIndex(hoverKey, hoveredIndex, hoverKeys));

  // --- Keyboard navigation (FR-5) ------------------------------------------
  // Active when wired explicitly (`keyboardNav`) or implicitly (`onSelectKey`).
  // Renders a focusable overlay (one transparent hit-rect per point) carrying a
  // single roving tab stop. Arrow/Home/End move focus, Enter/Space select,
  // Escape leaves. Focus also feeds the shared hover channel (FR-3 synergy).
  const navEnabled = $derived((keyboardNav === true || onSelectKey !== undefined) && points.length > 0);
  // Comfortable square hit area centred on each dot.
  const NAV_HIT = 18;
  function focusDatum(index: number) {
    focusedIndex = index;
    datapointRefs[index]?.focus();
    emitHoverKey(index);
  }
  function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
    const action = datapointNavAction(event.key, index, points.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      focusDatum(action.index);
    } else if (action.kind === "select") {
      onSelectKey?.(hoverKeys[index] ?? null);
    } else {
      focusedIndex = -1;
      emitHoverKey(null);
      onSelectKey?.(null);
      (event.currentTarget as SVGElement).blur();
    }
  }

  const classes = () =>
    ["st-lineChart", `st-lineChart--${tone}`, className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-lineChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={handleLeave}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
    <!-- gridlines + Y axis ticks -->
    {#each gridLines as g (g.value)}
      <line
        class="st-lineChart__grid"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={g.y}
        y2={g.y}
      />
      <text
        class="st-lineChart__tickLabel"
        x={MARGIN.left - 6}
        y={g.y}
        text-anchor="end"
        dominant-baseline="middle"
      >
        {formatTick(g.value)}
      </text>
    {/each}

    <!-- axes -->
    <line
      class="st-lineChart__axis"
      x1={MARGIN.left}
      x2={MARGIN.left}
      y1={MARGIN.top}
      y2={height - MARGIN.bottom}
    />
    <line
      class="st-lineChart__axis"
      x1={MARGIN.left}
      x2={width - MARGIN.right}
      y1={height - MARGIN.bottom}
      y2={height - MARGIN.bottom}
    />

    <!-- X tick labels -->
    {#each xTickEntries as tick, i (i)}
      <text
        class="st-lineChart__tickLabel"
        x={tick.x}
        y={height - MARGIN.bottom + 16}
        text-anchor="middle"
      >
        {tick.label}
      </text>
    {/each}

    <!-- Analytical overlays — bands + reference lines + trend BELOW the data
         (markers, not series); the goal line is drawn above for emphasis. -->
    {#each bandRects as b (b.key)}
      <rect class={`st-lineChart__band ${overlayToneClass("st-lineChart__band", b.tone)}`} x={b.x} y={b.y} width={b.width} height={b.height} />
      {#if b.label}
        <text class="st-lineChart__overlayLabel" x={b.x + 4} y={b.y + 11}>{b.label}</text>
      {/if}
    {/each}

    {#each refLines as r (r.key)}
      <line class={`st-lineChart__refLine ${overlayToneClass("st-lineChart__refLine", r.tone)}`} x1={r.x1} x2={r.x2} y1={r.y1} y2={r.y2} />
      {#if r.label}
        <text
          class="st-lineChart__overlayLabel"
          x={r.axis === "x" ? r.x1 + 4 : MARGIN.left + plotWidth - 4}
          y={r.axis === "x" ? MARGIN.top + 11 : r.y1 - 4}
          text-anchor={r.axis === "x" ? "start" : "end"}
        >{r.label}</text>
      {/if}
    {/each}

    {#if trendLine}
      <line class="st-lineChart__trend" x1={trendLine.x1} y1={trendLine.y1} x2={trendLine.x2} y2={trendLine.y2} />
    {/if}

    <!-- Annotation regions sit BEHIND the series (filled bands). -->
    {#if annotationRegions.length > 0}
      <g class="st-lineChart__annotations st-lineChart__annotations--behind">
        {#each annotationRegions as a (a.key)}
          {#if a.kind === "region"}
            <rect class="st-lineChart__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
            {#if a.label}
              <text class="st-lineChart__annotationLabel" x={a.x + 4} y={a.y + 11}>{a.label}</text>
            {/if}
          {/if}
        {/each}
      </g>
    {/if}

    {#if area && areaPath}
      <path class="st-lineChart__area" d={areaPath} />
    {/if}
    {#each solidPaths as d, i (i)}
      <path
        class="st-lineChart__line"
        {d}
        fill="none"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    {/each}
    {#each forecastPaths as d, i (i)}
      <path
        class="st-lineChart__line st-lineChart__line--forecast"
        {d}
        fill="none"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    {/each}

    {#each points as p (p.index)}
      <circle
        class={forecastFlags[p.index]
          ? "st-lineChart__dot st-lineChart__dot--forecast"
          : "st-lineChart__dot"}
        cx={p.x}
        cy={p.y}
        r="4"
        data-chart-index={p.index}
      />
    {/each}

    <!-- Goal line — emphasised, ABOVE the data. -->
    {#if goalGeom}
      <line class="st-lineChart__goalLine" x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={goalGeom.y} y2={goalGeom.y} />
      <text class="st-lineChart__goalLabel" x={MARGIN.left + plotWidth - 4} y={goalGeom.y - 4} text-anchor="end">
        {goalGeom.label ?? `Objectif ${goalGeom.value}`}
      </text>
    {/if}

    <!-- Annotations ABOVE the series: lines, shapes, points, labels. -->
    {#if annotationAbove.length > 0}
      <g class="st-lineChart__annotations st-lineChart__annotations--above">
        {#each annotationAbove as a (a.key)}
          {#if a.kind === "line"}
            <line class="st-lineChart__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
            {#if a.label}
              <text
                class="st-lineChart__annotationLabel"
                x={a.axis === "x" ? a.x1 + 4 : MARGIN.left + plotWidth - 4}
                y={a.axis === "x" ? MARGIN.top + 11 : a.y1 - 4}
                text-anchor={a.axis === "x" ? "start" : "end"}
              >{a.label}</text>
            {/if}
          {:else if a.kind === "shape"}
            <polygon class="st-lineChart__annotationShape" points={polygonPoints(a.points)} />
            {#if a.label}
              <text class="st-lineChart__annotationLabel" x={a.labelX} y={a.labelY} text-anchor="middle">{a.label}</text>
            {/if}
          {:else if a.kind === "point"}
            <circle class="st-lineChart__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
            {#if a.label}
              <text class="st-lineChart__annotationLabel" x={a.x} y={a.y - 8} text-anchor="middle">{a.label}</text>
            {/if}
          {:else}
            <text class="st-lineChart__annotationText" x={a.x} y={a.y} text-anchor={a.anchor}>{a.text}</text>
          {/if}
        {/each}
      </g>
    {/if}

    <!-- Data labels — one value per point, drawn on top. aria-hidden. -->
    {#if dataLabelItems.length > 0}
      <g class="st-lineChart__dataLabels" aria-hidden="true">
        {#each dataLabelItems as d (d.key)}
          <text class="st-lineChart__dataLabel" x={d.x} y={d.y} text-anchor="middle" dominant-baseline={d.baseline}>{d.text}</text>
        {/each}
      </g>
    {/if}

    <!-- Crosshair (FR-3) — a tokenised vertical line + marker at the active key.
         Decorative (aria-hidden); the value is in the tooltip + ChartDataList. -->
    {#if activeIndex >= 0 && points[activeIndex]}
      {@const cp = points[activeIndex]}
      <g class="st-lineChart__crosshair" aria-hidden="true">
        <line class="st-lineChart__crosshairLine" x1={cp.x} x2={cp.x} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
        <circle class="st-lineChart__crosshairMarker" cx={cp.x} cy={cp.y} r="5" />
      </g>
    {/if}
    </svg>

    <!-- Keyboard navigation overlay (FR-5) — a focusable, transparent hit layer
         over the points. NOT aria-hidden: it is the accessible roving cursor.
         Each rect announces its category + value; the focus ring is tokenised
         via CSS. Absent unless keyboard nav is enabled. -->
    {#if navEnabled}
      <svg
        class="st-lineChart__navLayer"
        viewBox="0 0 {width} {height}"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        role="group"
        aria-label={`${label} — points de données`}
      >
        {#each points as p, i (p.index)}
          <rect
            bind:this={datapointRefs[i]}
            class="st-lineChart__navDatum"
            x={p.x - NAV_HIT / 2}
            y={p.y - NAV_HIT / 2}
            width={NAV_HIT}
            height={NAV_HIT}
            rx="3"
            role="img"
            tabindex={rovingTabIndex(i, focusedIndex, points.length)}
            aria-label={datapointAriaLabel(p.datum.x, p.datum.y)}
            onkeydown={(event) => handleDatapointKeyDown(event, i)}
            onfocus={() => {
              focusedIndex = i;
              emitHoverKey(i);
            }}
          />
        {/each}
      </svg>
    {/if}
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if activeIndex >= 0 && points[activeIndex]}
    {@const p = points[activeIndex]}
    <div
      class="st-lineChart__tooltip"
      role="presentation"
      style="left: {(p.x / width) * 100}%; top: {(p.y / height) * 100}%"
    >
      <span class="st-lineChart__tooltipLabel">{p.datum.x}</span>
      <span class="st-lineChart__tooltipValue">{p.datum.y}</span>
    </div>
  {/if}
</div>

<style>
  .st-lineChart {
    color: var(--st-semantic-data-category1);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-lineChart--category1 { color: var(--st-semantic-data-category1); }
  .st-lineChart--category2 { color: var(--st-semantic-data-category2); }
  .st-lineChart--category3 { color: var(--st-semantic-data-category3); }
  .st-lineChart--category4 { color: var(--st-semantic-data-category4); }
  .st-lineChart--category5 { color: var(--st-semantic-data-category5); }
  .st-lineChart--category6 { color: var(--st-semantic-data-category6); }
  .st-lineChart--category7 { color: var(--st-semantic-data-category7); }
  .st-lineChart--category8 { color: var(--st-semantic-data-category8); }

  .st-lineChart svg {
    display: block;
    overflow: visible;
  }

  .st-lineChart__visual {
    display: block;
    position: relative;
  }

  .st-lineChart__grid {
    stroke: var(--st-component-lineChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-lineChart__axis {
    stroke: var(--st-component-lineChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-lineChart__tickLabel {
    fill: var(--st-component-lineChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-lineChart__line {
    stroke: currentColor;
  }

  /* Forecast segment — dashed, dedicated tokenized tone (palette purple),
     mirrors the dataviz ForecastLineChart fallback (dasharray 5 4). */
  .st-lineChart__line--forecast {
    stroke: var(--st-component-lineChart-forecastStroke, var(--st-semantic-data-category7));
    stroke-dasharray: 5 4;
  }

  .st-lineChart__area {
    fill: currentColor;
    opacity: 0.18;
    stroke: none;
  }

  .st-lineChart__dot {
    fill: currentColor;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
    cursor: pointer;
    transition: r 120ms ease;
  }

  .st-lineChart__dot:hover {
    r: 5.5;
  }

  .st-lineChart__dot--forecast {
    fill: var(--st-component-lineChart-forecastStroke, var(--st-semantic-data-category7));
  }

  @media (prefers-reduced-motion: reduce) {
    .st-lineChart__dot {
      transition: none;
    }
  }

  .st-lineChart__tooltip {
    background: var(--st-component-lineChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-lineChart-tooltipText, var(--st-semantic-text-inverse));
    display: inline-flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.125rem;
    line-height: 1.2;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, calc(-100% - 8px));
    white-space: nowrap;
    z-index: 1;
  }

  .st-lineChart__tooltipLabel {
    font-weight: 600;
  }

  .st-lineChart__tooltipValue {
    opacity: 0.85;
  }

  /* --- Analytical overlay layer --------------------------------------------
     Bands sit BELOW the data via render order; their fill uses color-mix (a
     semi-transparent tint of the tone token) rather than raw opacity, so the
     data series drawn on top keeps full contrast. */
  .st-lineChart__band {
    fill: color-mix(in srgb, var(--st-overlay-tone, var(--st-semantic-border-strong)) 12%, transparent);
    stroke: none;
  }
  .st-lineChart__band--neutral { --st-overlay-tone: var(--st-semantic-border-strong); }
  .st-lineChart__band--success { --st-overlay-tone: var(--st-semantic-feedback-success); }
  .st-lineChart__band--warning { --st-overlay-tone: var(--st-semantic-feedback-warning); }
  .st-lineChart__band--error { --st-overlay-tone: var(--st-semantic-feedback-error); }
  .st-lineChart__band--info { --st-overlay-tone: var(--st-semantic-feedback-info); }

  .st-lineChart__refLine {
    stroke: var(--st-overlay-tone, var(--st-semantic-border-strong));
    stroke-width: 1;
    stroke-dasharray: 4 3;
  }
  .st-lineChart__refLine--neutral { --st-overlay-tone: var(--st-semantic-border-strong); }
  .st-lineChart__refLine--success { --st-overlay-tone: var(--st-semantic-feedback-success); }
  .st-lineChart__refLine--warning { --st-overlay-tone: var(--st-semantic-feedback-warning); }
  .st-lineChart__refLine--error { --st-overlay-tone: var(--st-semantic-feedback-error); }
  .st-lineChart__refLine--info { --st-overlay-tone: var(--st-semantic-feedback-info); }

  .st-lineChart__overlayLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.625rem;
  }

  .st-lineChart__trend {
    stroke: var(--st-semantic-text-secondary);
    stroke-width: 1.5;
    stroke-dasharray: 6 4;
    opacity: 0.85;
  }

  /* Goal line — drawn ABOVE the data, emphasised (thicker, solid accent). */
  .st-lineChart__goalLine {
    stroke: var(--st-semantic-feedback-success);
    stroke-width: 2.5;
  }
  .st-lineChart__goalLabel {
    fill: var(--st-semantic-feedback-success);
    font-size: 0.6875rem;
    font-weight: 600;
  }

  /* --- Annotation layer ----------------------------------------------------
     Regions render BEHIND the series; lines/shapes/points/labels render ABOVE. */
  .st-lineChart__annotationRegion {
    fill: color-mix(in srgb, var(--st-semantic-feedback-info) 12%, transparent);
    stroke: none;
  }
  .st-lineChart__annotationLine {
    stroke: var(--st-semantic-feedback-info);
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
  }
  .st-lineChart__annotationShape {
    fill: color-mix(in srgb, var(--st-semantic-feedback-info) 14%, transparent);
    stroke: var(--st-semantic-feedback-info);
    stroke-width: 1.5;
  }
  .st-lineChart__annotationPoint {
    fill: var(--st-semantic-feedback-info);
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
  }
  .st-lineChart__annotationLabel,
  .st-lineChart__annotationText {
    fill: var(--st-semantic-text-primary);
    font-size: 0.625rem;
    font-weight: 600;
  }

  /* Data labels — per-point value, drawn on top. Token-only colour. */
  .st-lineChart__dataLabel {
    fill: var(--st-semantic-text-primary);
    font-size: 0.6875rem;
    font-weight: 600;
  }

  /* --- Crosshair layer (FR-3) ----------------------------------------------
     A tokenised dashed vertical line at the active (hovered/controlled) key,
     plus an emphasised marker on the point. Decorative (aria-hidden). */
  .st-lineChart__crosshairLine {
    stroke: var(--st-semantic-border-strong);
    stroke-width: 1;
    stroke-dasharray: 3 3;
    opacity: 0.7;
  }
  .st-lineChart__crosshairMarker {
    fill: currentColor;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 2;
  }
</style>
