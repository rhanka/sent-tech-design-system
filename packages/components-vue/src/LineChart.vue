<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  clampFraction,
  extendValueDomain,
  fixedLogTicks,
  fixedTicks,
  forecastRuns,
  formatTick,
  isNumeric,
  linearRegression,
  logTicks,
  niceTicks,
  overlayDataListItems,
  overlayToneClass,
  scaleLinear,
  smallestPositive,
  validLinearDomain,
  validLogDomain,
  type ChartBand,
  type ChartGoalLine,
  type ChartReferenceLine,
  type ChartScale,
  type ForecastRun,
} from './chartScale.js';
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from './chartAnnotations.js';
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from './chartDataLabels.js';
import { keyForX, resolveActiveIndex } from './chartCrosshair.js';
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from './chartKeyboardNav.js';

export type LineChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

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

export type LineChartProps = {
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
   * min<max) the y scale uses it instead of the data-derived range. Invalid or
   * absent → auto range (unchanged).
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
   * no legend surface; accepted for parity and otherwise ignored.
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

const MARGIN = CHART_MARGIN;

defineOptions({ name: 'LineChart', inheritAttrs: false });
const props = withDefaults(defineProps<LineChartProps>(), {
  width: 480, height: 240, tone: 'category1', smooth: false, area: false,
  referenceLines: undefined, bands: undefined, goalLine: undefined, trend: false,
  annotations: undefined, dataLabels: undefined, domain: undefined, scale: 'linear',
  invertAxis: false, showLegend: undefined, hoverKey: undefined, onHoverKeyChange: undefined,
  keyboardNav: undefined, onSelectKey: undefined, class: undefined,
});

const hoveredIndex = ref<number | null>(null);
// FR-5 — roving keyboard focus over the data points (separate from hover).
const focusedIndex = ref<number>(-1);
const datapointRefs: Array<SVGRectElement | null> = [];

function setDatapointRef(el: unknown, index: number) {
  datapointRefs[index] = el as SVGRectElement | null;
}

const geometry = computed(() => {
  const width = props.width ?? 480;
  const height = props.height ?? 240;
  const tone = props.tone ?? 'category1';
  const smooth = props.smooth ?? false;
  const area = props.area ?? false;
  const data = props.data;
  const referenceLines = props.referenceLines;
  const bands = props.bands;
  // A valid goal line needs a finite value; otherwise it is ignored.
  const goal = props.goalLine && Number.isFinite(props.goalLine.value) ? props.goalLine : null;
  const trend = props.trend ?? false;

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  let xDomain:
    | { kind: 'ordinal'; values: (number | string)[] }
    | { kind: 'numeric'; min: number; max: number };
  if (data.length === 0) {
    xDomain = { kind: 'ordinal', values: [] };
  } else if (data.every((d) => isNumeric(d.x))) {
    const xs = data.map((d) => d.x as number);
    xDomain = { kind: 'numeric', min: Math.min(...xs), max: Math.max(...xs) };
  } else {
    xDomain = { kind: 'ordinal', values: data.map((d) => d.x) };
  }

  const isLog = props.scale === 'log';
  const invertAxis = props.invertAxis ?? false;
  const domain = props.domain;
  const validDomain = isLog ? validLogDomain(domain) : validLinearDomain(domain);

  let yTicks: number[];
  const ys = data.map((d) => d.y).filter((y) => Number.isFinite(y));
  if (isLog) {
    const posOverlays = [
      ...(referenceLines ?? []).filter((r) => (r.axis ?? 'y') === 'y').map((r) => r.value),
      ...(bands ?? []).flatMap((b) => [b.from, b.to]),
      ...(goal ? [goal.value] : []),
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
    yTicks = validDomain ? fixedLogTicks(lo, hi) : logTicks(lo, hi);
  } else if (validDomain) {
    yTicks = fixedTicks(validDomain[0], validDomain[1], 5);
  } else if (ys.length === 0 && !referenceLines?.length && !bands?.length && !goal) {
    yTicks = [0];
  } else {
    let yMin = ys.length ? Math.min(...ys) : 0;
    let yMax = ys.length ? Math.max(...ys) : 0;
    // Fold overlay values into the domain so they never fall outside the plot.
    [yMin, yMax] = extendValueDomain(yMin, yMax, { referenceLines, bands, goalLine: goal });
    const padded = (yMax - yMin) * 0.08 || Math.max(Math.abs(yMax), 1) * 0.1;
    yTicks = niceTicks(yMin - padded, yMax + padded, 5);
  }
  const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

  // Maps a y value to a fraction in [0,1] (0 = yDomain.min, 1 = yDomain.max),
  // honouring log scale + axis inversion. Linear + no invert is unchanged.
  const valueFraction = (v: number) => {
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
  };

  type Point = { x: number; y: number; datum: LineChartDatum; index: number };
  let points: Point[] = [];
  if (data.length !== 0) {
    points = data.map((d, i) => {
      let x: number;
      if (xDomain.kind === 'numeric') {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(data.length - 1, 1);
        x = data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const y = plotHeight * (1 - valueFraction(d.y));
      return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
    });
  }

  // --- Analytical overlays -----------------------------------------------
  const valueToY = (v: number) => MARGIN.top + plotHeight * (1 - valueFraction(v));
  const dataValueToX = (v: number) =>
    xDomain.kind === 'numeric'
      ? MARGIN.left + scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth)
      : null;

  const bandRects = (bands ?? [])
    .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
    .map((b, i) => {
      const y1 = valueToY(b.from);
      const y2 = valueToY(b.to);
      return {
        key: i,
        x: MARGIN.left,
        y: Math.min(y1, y2),
        width: plotWidth,
        height: Math.max(Math.abs(y2 - y1), 0.5),
        label: b.label,
        tone: b.tone,
      };
    });

  type Ref = { key: number; axis: 'x' | 'y'; x1: number; x2: number; y1: number; y2: number; label?: string; tone?: ChartReferenceLine['tone'] };
  const refLines: Ref[] = [];
  (referenceLines ?? [])
    .filter((r) => Number.isFinite(r.value))
    .forEach((r, i) => {
      const axis = r.axis ?? 'y';
      if (axis === 'x') {
        const x = dataValueToX(r.value);
        if (x === null) return;
        refLines.push({ key: i, axis, x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + plotHeight, label: r.label, tone: r.tone });
      } else {
        const y = valueToY(r.value);
        refLines.push({ key: i, axis, x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: y, y2: y, label: r.label, tone: r.tone });
      }
    });

  const goalGeom = goal
    ? { y: valueToY(goal.value), label: goal.label, value: goal.value }
    : null;

  const trendModel =
    trend && xDomain.kind === 'numeric'
      ? linearRegression(data.map((d) => ({ x: d.x as number, y: d.y })))
      : null;
  const trendLine =
    trendModel && xDomain.kind === 'numeric'
      ? {
          x1: MARGIN.left + scaleLinear(trendModel.minX, xDomain.min, xDomain.max, 0, plotWidth),
          y1: valueToY(trendModel.slope * trendModel.minX + trendModel.intercept),
          x2: MARGIN.left + scaleLinear(trendModel.maxX, xDomain.min, xDomain.max, 0, plotWidth),
          y2: valueToY(trendModel.slope * trendModel.maxX + trendModel.intercept),
        }
      : null;

  // --- Annotation overlay -------------------------------------------------
  const ordinalIndex = (v: number | string) => {
    if (xDomain.kind !== 'ordinal') return null;
    const i = data.findIndex((d) => d.x === v);
    if (i < 0) return null;
    const denom = Math.max(data.length - 1, 1);
    return data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
  };
  const annotationXScale = (v: number | string): number | null => {
    if (xDomain.kind === 'numeric') {
      if (typeof v !== 'number' || !Number.isFinite(v)) return null;
      if (v < xDomain.min || v > xDomain.max) return null;
      return scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth);
    }
    return ordinalIndex(v);
  };
  const annotationYScale = (v: number): number | null => {
    if (!Number.isFinite(v)) return null;
    return plotHeight * (1 - valueFraction(v));
  };
  const resolvedAnnotations = resolveAnnotations(props.annotations, {
    xScale: annotationXScale,
    yScale: annotationYScale,
    plotLeft: MARGIN.left,
    plotTop: MARGIN.top,
    plotWidth,
    plotHeight,
  });
  const annotationRegions = resolvedAnnotations.filter((a) => a.kind === 'region');
  const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== 'region');

  // --- Data labels ------------------------------------------------------
  const dataLabelOpts = normalizeDataLabels(props.dataLabels);
  type DataLabelItem = { key: number; x: number; y: number; text: string; baseline: string };
  const dataLabelItems: DataLabelItem[] = dataLabelOpts.enabled
    ? points.map((p) => {
        const text = formatDataLabel(p.datum.y, dataLabelOpts, formatTick);
        const center = dataLabelOpts.position === 'center' || dataLabelOpts.position === 'inside';
        return { key: p.index, x: p.x, y: center ? p.y : p.y - 8, text, baseline: center ? 'middle' : 'auto' };
      })
    : [];

  // --- Forecast segments --------------------------------------------------
  const forecastFlags = data.map((d) => d.forecast === true);
  const hasForecast = forecastFlags.some(Boolean);

  const dataValueItems = [
    ...data.map((d, i) => (forecastFlags[i] ? `${d.x}: ${d.y} (prévision)` : `${d.x}: ${d.y}`)),
    ...overlayDataListItems({ referenceLines, bands, goalLine: goal, trend: trendModel }),
    ...annotationDataListItems(props.annotations),
  ];

  // Full-series path (area fill always covers the whole series).
  const fullLinePath = points.length === 0 ? '' : smooth ? buildSmoothPath(points) : buildLinearPath(points);

  // Solid (actual) + dashed (forecast) sub-paths. Without any forecast
  // datum the solid list is exactly [fullLinePath] — the previous single path.
  const segmentPath = (run: ForecastRun) => {
    const seg = points.slice(run.start, run.end + 1);
    return smooth ? buildSmoothPath(seg) : buildLinearPath(seg);
  };
  const runs = hasForecast ? forecastRuns(forecastFlags) : [];
  const solidPaths = hasForecast
    ? runs.filter((r) => !r.forecast).map(segmentPath)
    : fullLinePath
      ? [fullLinePath]
      : [];
  const forecastPaths = runs.filter((r) => r.forecast).map(segmentPath);

  let areaPath = '';
  if (area && points.length !== 0) {
    const base = MARGIN.top + plotHeight;
    const first = points[0];
    const last = points[points.length - 1];
    areaPath = `${fullLinePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  }

  const gridLines = yTicks.map((tick) => ({
    value: tick,
    y: MARGIN.top + plotHeight * (1 - valueFraction(tick)),
  }));

  let xTickEntries: { x: number; label: string }[] = [];
  if (data.length !== 0) {
    if (xDomain.kind === 'ordinal') {
      xTickEntries = points.map((p, i) => ({ x: p.x, label: String(data[i].x) }));
    } else {
      const target = Math.min(5, data.length);
      const stride = Math.max(1, Math.round((data.length - 1) / (target - 1 || 1)));
      for (let i = 0; i < data.length; i += stride) {
        xTickEntries.push({ x: points[i].x, label: String(data[i].x) });
      }
      const lastIdx = data.length - 1;
      if (xTickEntries[xTickEntries.length - 1]?.label !== String(data[lastIdx].x)) {
        xTickEntries.push({ x: points[lastIdx].x, label: String(data[lastIdx].x) });
      }
    }
  }

  return {
    width, height, tone, plotWidth, plotHeight, points, yTicks, gridLines, xTickEntries,
    bandRects, refLines, trendLine, goalGeom, annotationRegions, annotationAbove,
    dataLabelItems, forecastFlags, dataValueItems, solidPaths, forecastPaths, areaPath, area,
  };
});

const hoverKeys = computed(() => props.data.map((d) => keyForX(d.x)));
const emitHoverKey = (index: number | null) => {
  props.onHoverKeyChange?.(index == null ? null : hoverKeys.value[index] ?? null);
};
function handleLeave() {
  hoveredIndex.value = null;
  emitHoverKey(null);
}
function handleVisualPointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    emitHoverKey(null);
    return;
  }
  const raw = Number(target.getAttribute('data-chart-index'));
  const index = Number.isInteger(raw) ? raw : null;
  hoveredIndex.value = index;
  emitHoverKey(index);
}

// Index whose crosshair/tooltip is DISPLAYED: the controlled `hoverKey`
// when provided (resolved against `hoverKeys`), else the pointer index.
const activeIndex = computed(() => resolveActiveIndex(props.hoverKey, hoveredIndex.value, hoverKeys.value));
const hoveredPoint = computed(() => (activeIndex.value >= 0 ? geometry.value.points[activeIndex.value] : undefined));

// --- Keyboard navigation (FR-5) --------------------------------------
const navEnabled = computed(() => (props.keyboardNav === true || props.onSelectKey !== undefined) && geometry.value.points.length > 0);
// Comfortable square hit area centred on each dot.
const NAV_HIT = 18;
const focusDatum = (index: number) => {
  focusedIndex.value = index;
  datapointRefs[index]?.focus();
  emitHoverKey(index);
};
function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
  const points = geometry.value.points;
  const action = datapointNavAction(event.key, index, points.length);
  if (!action) return;
  event.preventDefault();
  if (action.kind === 'move') {
    focusDatum(action.index);
  } else if (action.kind === 'select') {
    props.onSelectKey?.(hoverKeys.value[index] ?? null);
  } else {
    focusedIndex.value = -1;
    emitHoverKey(null);
    props.onSelectKey?.(null);
    (event.currentTarget as SVGElement).blur();
  }
}
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-lineChart', `st-lineChart--${geometry.tone}`, props.class)) }" >
    <div class="st-lineChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${geometry.width} ${geometry.height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="g in geometry.gridLines" :key="`g${g.value}`">
          <line class="st-lineChart__grid" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="g.y" :y2="g.y" />
          <text class="st-lineChart__tickLabel" :x="MARGIN.left - 6" :y="g.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(g.value) }}</text>
        </template>
        <line class="st-lineChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="geometry.height - MARGIN.bottom" />
        <line class="st-lineChart__axis" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="geometry.height - MARGIN.bottom" :y2="geometry.height - MARGIN.bottom" />
        <text v-for="(tick, i) in geometry.xTickEntries" :key="`x${i}`" class="st-lineChart__tickLabel" :x="tick.x" :y="geometry.height - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
        <template v-for="b in geometry.bandRects" :key="`band${b.key}`">
          <rect :class="classNames('st-lineChart__band', overlayToneClass('st-lineChart__band', b.tone))" :x="b.x" :y="b.y" :width="b.width" :height="b.height" />
          <text v-if="b.label" class="st-lineChart__overlayLabel" :x="b.x + 4" :y="b.y + 11">{{ b.label }}</text>
        </template>
        <template v-for="r in geometry.refLines" :key="`ref${r.key}`">
          <line :class="classNames('st-lineChart__refLine', overlayToneClass('st-lineChart__refLine', r.tone))" :x1="r.x1" :x2="r.x2" :y1="r.y1" :y2="r.y2" />
          <text v-if="r.label" class="st-lineChart__overlayLabel" :x="r.axis === 'x' ? r.x1 + 4 : MARGIN.left + geometry.plotWidth - 4" :y="r.axis === 'x' ? MARGIN.top + 11 : r.y1 - 4" :text-anchor="r.axis === 'x' ? 'start' : 'end'">{{ r.label }}</text>
        </template>
        <line v-if="geometry.trendLine" class="st-lineChart__trend" :x1="geometry.trendLine.x1" :y1="geometry.trendLine.y1" :x2="geometry.trendLine.x2" :y2="geometry.trendLine.y2" />
        <g v-if="geometry.annotationRegions.length > 0" class="st-lineChart__annotations st-lineChart__annotations--behind">
          <template v-for="a in geometry.annotationRegions" :key="`ann-region-${a.key}`">
            <rect class="st-lineChart__annotationRegion" :x="a.x" :y="a.y" :width="a.width" :height="a.height" />
            <text v-if="a.label" class="st-lineChart__annotationLabel" :x="a.x + 4" :y="a.y + 11">{{ a.label }}</text>
          </template>
        </g>
        <path v-if="geometry.area && geometry.areaPath" class="st-lineChart__area" :d="geometry.areaPath" />
        <path v-for="(d, i) in geometry.solidPaths" :key="`line-${i}`" class="st-lineChart__line" :d="d" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path v-for="(d, i) in geometry.forecastPaths" :key="`forecast-${i}`" class="st-lineChart__line st-lineChart__line--forecast" :d="d" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <circle v-for="p in geometry.points" :key="p.index" :class="classNames('st-lineChart__dot', geometry.forecastFlags[p.index] && 'st-lineChart__dot--forecast')" :cx="p.x" :cy="p.y" r="4" :data-chart-index="p.index" />
        <template v-if="geometry.goalGeom">
          <line class="st-lineChart__goalLine" :x1="MARGIN.left" :x2="MARGIN.left + geometry.plotWidth" :y1="geometry.goalGeom.y" :y2="geometry.goalGeom.y" />
          <text class="st-lineChart__goalLabel" :x="MARGIN.left + geometry.plotWidth - 4" :y="geometry.goalGeom.y - 4" text-anchor="end">{{ geometry.goalGeom.label ?? `Objectif ${geometry.goalGeom.value}` }}</text>
        </template>
        <g v-if="geometry.annotationAbove.length > 0" class="st-lineChart__annotations st-lineChart__annotations--above">
          <template v-for="a in geometry.annotationAbove" :key="`ann-${a.key}`">
            <template v-if="a.kind === 'line'">
              <line class="st-lineChart__annotationLine" :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" />
              <text v-if="a.label" class="st-lineChart__annotationLabel" :x="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + geometry.plotWidth - 4" :y="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4" :text-anchor="a.axis === 'x' ? 'start' : 'end'">{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'shape'">
              <polygon class="st-lineChart__annotationShape" :points="polygonPoints(a.points)" />
              <text v-if="a.label" class="st-lineChart__annotationLabel" :x="a.labelX" :y="a.labelY" text-anchor="middle">{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'point'">
              <circle class="st-lineChart__annotationPoint" :cx="a.x" :cy="a.y" r="4.5" />
              <text v-if="a.label" class="st-lineChart__annotationLabel" :x="a.x" :y="a.y - 8" text-anchor="middle">{{ a.label }}</text>
            </template>
            <text v-else class="st-lineChart__annotationText" :x="a.x" :y="a.y" :text-anchor="(a as { anchor?: string }).anchor ?? (a as { anchor: string }).anchor">{{ a.text }}</text>
          </template>
        </g>
        <g v-if="geometry.dataLabelItems.length > 0" class="st-lineChart__dataLabels" aria-hidden="true">
          <text v-for="d in geometry.dataLabelItems" :key="`dl-${d.key}`" class="st-lineChart__dataLabel" :x="d.x" :y="d.y" text-anchor="middle" :dominant-baseline="d.baseline">{{ d.text }}</text>
        </g>
        <g v-if="hoveredPoint" class="st-lineChart__crosshair" aria-hidden="true">
          <line class="st-lineChart__crosshairLine" :x1="hoveredPoint.x" :x2="hoveredPoint.x" :y1="MARGIN.top" :y2="MARGIN.top + geometry.plotHeight" />
          <circle class="st-lineChart__crosshairMarker" :cx="hoveredPoint.x" :cy="hoveredPoint.y" r="5" />
        </g>
      </svg>
      <svg v-if="navEnabled" class="st-lineChart__navLayer" :viewBox="`0 0 ${geometry.width} ${geometry.height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" role="group" :aria-label="`${props.label} — points de données`">
        <rect v-for="(p, i) in geometry.points" :key="p.index" :ref="(el: unknown) => setDatapointRef(el, i)" class="st-lineChart__navDatum" :x="p.x - 9" :y="p.y - 9" :width="18" :height="18" rx="3" role="img" :tabindex="rovingTabIndex(i, focusedIndex, geometry.points.length)" :aria-label="datapointAriaLabel(p.datum.x, p.datum.y)" @keydown="handleDatapointKeyDown($event, i)" @focus="focusedIndex = i; emitHoverKey(i)" />
      </svg>
    </div>
    <ul v-if="geometry.dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredPoint" class="st-lineChart__tooltip" role="presentation" :style="`left: ${(hoveredPoint.x / geometry.width) * 100}%; top: ${(hoveredPoint.y / geometry.height) * 100}%`">
      <span class="st-lineChart__tooltipLabel">{{ String(hoveredPoint.datum.x) }}</span><span class="st-lineChart__tooltipValue">{{ String(hoveredPoint.datum.y) }}</span>
    </div>
  </div>
</template>
