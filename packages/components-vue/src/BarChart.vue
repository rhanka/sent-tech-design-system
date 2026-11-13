<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import {
  CHART_MARGIN,
  clampFraction,
  extendValueDomain,
  fixedLogTicks,
  fixedTicks,
  formatTick,
  logTicks,
  niceTicks,
  overlayDataListItems,
  overlayToneClass,
  smallestPositive,
  validLinearDomain,
  validLogDomain,
  type ChartBand,
  type ChartGoalLine,
  type ChartReferenceLine,
  type ChartScale,
} from './chartScaleModel.js';
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from './chartAnnotations.js';
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from './chartDataLabels.js';
import { resolveActiveIndex } from './chartCrosshair.js';
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from './chartKeyboardNav.js';

export type BarChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type BarChartDatum = {
  label: string;
  value: number;
  tone?: BarChartTone;
  /** Lower error-bar extent (value-axis units). Drawn only when finite. */
  errorLow?: number;
  /** Upper error-bar extent (value-axis units). Drawn only when finite. */
  errorHigh?: number;
};

export type BarChartProps = {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * BarCharts in a grid share one scale (small multiples). When absent or
   * invalid, the scale falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  /**
   * Keys of the currently selected bars (a bar's key is its `label`).
   * CONTROLLED — the parent owns the toggle; the component never stores
   * selection. When non-empty the selected bars stay full opacity (+ accent)
   * and the rest dim; when empty every bar is normal. Defaults to [].
   */
  selectedKeys?: string[];
  /**
   * Called with the bar's key (its `label`) when the user selects it. When
   * provided, an ACCESSIBLE row of filter chips (real <button>s) is rendered
   * OUTSIDE the aria-hidden SVG — that is the keyboard + screen-reader surface.
   * The SVG bars themselves stay decorative (aria-hidden) and only offer a
   * mouse click shortcut for sighted pointer users. When omitted the chart is
   * purely presentational (no interactivity, unchanged).
   */
  onSelect?: (key: string) => void;
  /** Reference lines on the value axis (default `axis: "y"`). */
  referenceLines?: ChartReferenceLine[];
  /** Shaded value-axis bands between `from`..`to`. */
  bands?: ChartBand[];
  /** A single goal line, emphasised above the bars. */
  goalLine?: ChartGoalLine;
  /**
   * Annotation overlay in DATA space. The x coordinate is CATEGORICAL — it
   * matches a bar by its `label` (centre of band) and is ignored otherwise; the
   * y coordinate (and `value`/`from`/`to`) are value-axis numbers. Regions
   * render behind the bars, every other kind above. Additive: absent ⇒
   * unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-bar value labels. `false`/absent (default) → none. `true` → each bar's
   * value with the chart's numeric formatter. Object → `format(value)` and/or a
   * `position` override. Default position is `outside` (above the bar in
   * vertical mode, past the bar end in horizontal mode). Labels are
   * `aria-hidden` — the values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * Value-axis scale. `"linear"` (default) is unchanged. `"log"` switches the
   * value axis to base-10 logarithmic — values `<= 0` are ignored for
   * domain/ticks and clamped to the lowest tick when positioned.
   */
  scale?: ChartScale;
  /** Inverts the value axis (high values toward the origin). Default false. */
  invertAxis?: boolean;
  /**
   * Toggles the legend if the chart has one. BarChart has no separate legend
   * surface (its filter chips double as one); accepted for cross-chart parity
   * and otherwise ignored.
   */
  showLegend?: boolean;
  /**
   * CONTROLLED synchronised hover key (FR-3). A bar's key is its `label`. When
   * provided (string or null), the crosshair + tooltip track this key instead of
   * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
   * share one hover channel across several aligned charts. Absent (`undefined`)
   * keeps the legacy uncontrolled behaviour. Independent of `selectedKeys`.
   */
  hoverKey?: string | null;
  /**
   * Emitted when the user hovers a bar (its `label`) or leaves the plot (`null`).
   * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
   * keep the shared hover channel in sync.
   */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
   * over the bars: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
   * bars (data order), Home/End jump to the first/last, Enter/Space select the
   * focused bar (`onSelectKey`), Escape leaves the navigation. Each focused bar
   * announces its `label` + value. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /**
   * Emitted when the user selects the focused bar via Enter/Space (its `label`),
   * or `null` when the navigation is left via Escape. Wiring it also turns the
   * keyboard navigation on. Independent of `onSelect`/`selectedKeys`.
   */
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

const MARGIN = CHART_MARGIN;

defineOptions({ name: 'BarChart', inheritAttrs: false });
const props = withDefaults(defineProps<BarChartProps>(), {
  width: 480, height: 240, orientation: 'vertical', domain: undefined,
  selectedKeys: () => [], onSelect: undefined, referenceLines: undefined, bands: undefined,
  goalLine: undefined, annotations: undefined, dataLabels: undefined, scale: 'linear',
  invertAxis: false, showLegend: undefined, hoverKey: undefined, onHoverKeyChange: undefined,
  keyboardNav: undefined, onSelectKey: undefined, class: undefined,
});

const hoveredIndex = ref<number | null>(null);
const focusedIndex = ref<number>(-1);
const datapointRefs: Array<SVGRectElement | null> = [];

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);
const orientation = computed(() => props.orientation ?? 'vertical');
const label = computed(() => props.label);
const data = computed(() => props.data);
const isVertical = computed(() => orientation.value === 'vertical');

const selectedSet = computed(() => new Set(props.selectedKeys ?? []));
const hasSelection = computed(() => selectedSet.value.size > 0);
const interactive = computed(() => typeof props.onSelect === 'function');

const isLog = computed(() => props.scale === 'log');
const validDomain = computed(() => (isLog.value ? validLogDomain(props.domain) : validLinearDomain(props.domain)));
const valueAxis = computed(() => (orientation.value === 'vertical' ? 'y' : 'x') as string);
const valueReferenceLines = computed(() => (props.referenceLines ?? []).filter((r) => (r.axis ?? 'y') === valueAxis.value));
const invertAxis = computed(() => props.invertAxis ?? false);
const values = computed(() => data.value.map((d) => d.value));
const goal = computed(() => (props.goalLine && Number.isFinite(props.goalLine.value) ? props.goalLine : null));
const errorExtents = computed(() => data.value.flatMap((d) =>
  [d.errorLow, d.errorHigh].filter((v): v is number => v !== undefined && Number.isFinite(v))));

const ticks = computed(() => {
  const valuesV = values.value;
  const goalV = goal.value;
  const errorExtentsV = errorExtents.value;
  if (isLog.value) {
    const posOverlays = [
      ...valueReferenceLines.value.map((r) => r.value),
      ...(props.bands ?? []).flatMap((b) => [b.from, b.to]),
      ...(goalV ? [goalV.value] : []),
      ...errorExtentsV,
    ];
    let lo: number;
    let hi: number;
    const validDomainV = validDomain.value;
    if (validDomainV) {
      lo = validDomainV[0];
      hi = validDomainV[1];
    } else {
      lo = smallestPositive(...valuesV, ...posOverlays);
      hi = Math.max(lo, ...valuesV.filter((v) => v > 0), ...posOverlays.filter((v) => v > 0));
    }
    return validDomainV ? fixedLogTicks(lo, hi) : logTicks(lo, hi);
  }
  let minRaw = validDomain.value ? validDomain.value[0] : Math.min(0, ...valuesV);
  let maxRaw = validDomain.value ? validDomain.value[1] : Math.max(0, ...valuesV);
  if (!validDomain.value) {
    [minRaw, maxRaw] = extendValueDomain(minRaw, maxRaw, {
      referenceLines: props.referenceLines,
      referenceAxis: valueAxis.value as 'x' | 'y',
      bands: props.bands,
      goalLine: goalV,
      extraValues: errorExtentsV,
    });
  }
  return validDomain.value ? fixedTicks(minRaw, maxRaw, 5) : niceTicks(minRaw, maxRaw, 5);
});
const domainMin = computed(() => ticks.value[0]);
const domainMax = computed(() => ticks.value[ticks.value.length - 1]);
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

function valueFraction(v: number): number {
  let f: number;
  if (isLog.value) {
    const lo = Math.log10(domainMin.value);
    const hi = Math.log10(domainMax.value);
    const clamped = v > 0 ? v : domainMin.value;
    f = hi === lo ? 0 : (Math.log10(clamped) - lo) / (hi - lo);
  } else {
    f = domainMax.value === domainMin.value ? 0 : (v - domainMin.value) / (domainMax.value - domainMin.value);
  }
  return clampFraction(invertAxis.value ? 1 - f : f);
}
const baselineValue = computed(() => (isLog.value ? domainMin.value : Math.min(domainMax.value, Math.max(domainMin.value, 0))));

type Bar = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  datum: BarChartDatum;
  tone: BarChartTone;
};

const bars = computed<Bar[]>(() => {
  const dataV = data.value;
  let result: Bar[] = [];
  if (dataV.length !== 0) {
    if (orientation.value === 'vertical') {
      const band = plotWidth.value / dataV.length;
      const barWidth = band * 0.62;
      const yOf = (v: number) => plotHeight.value * (1 - valueFraction(v));
      const zeroY = yOf(baselineValue.value);
      result = dataV.map((d, i) => {
        const valueY = yOf(d.value);
        const y = Math.min(valueY, zeroY);
        const hh = Math.abs(zeroY - valueY);
        const x = MARGIN.left + band * i + (band - barWidth) / 2;
        return {
          x,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(hh, 0.5),
          cx: MARGIN.left + band * (i + 0.5),
          cy: MARGIN.top + valueY,
          datum: d,
          tone: (d.tone ?? 'category1') as BarChartTone,
        };
      });
    } else {
      const band = plotHeight.value / dataV.length;
      const barHeight = band * 0.62;
      const xOf = (v: number) => plotWidth.value * valueFraction(v);
      const zeroX = xOf(baselineValue.value);
      result = dataV.map((d, i) => {
        const valueX = xOf(d.value);
        const x = Math.min(valueX, zeroX);
        const w = Math.abs(valueX - zeroX);
        const y = MARGIN.top + band * i + (band - barHeight) / 2;
        return {
          x: MARGIN.left + x,
          y,
          width: Math.max(w, 0.5),
          height: barHeight,
          cx: MARGIN.left + valueX,
          cy: MARGIN.top + band * (i + 0.5),
          datum: d,
          tone: (d.tone ?? 'category1') as BarChartTone,
        };
      });
    }
  }
  return result;
});

function valuePos(v: number): number {
  return isVertical.value
    ? MARGIN.top + plotHeight.value * (1 - valueFraction(v))
    : MARGIN.left + plotWidth.value * valueFraction(v);
}
const valueAxisEnd = computed(() => (isVertical.value ? MARGIN.left + plotWidth.value : MARGIN.top + plotHeight.value));

type BandRect = { key: number; x: number; y: number; width: number; height: number; label?: string; tone?: ChartBand['tone'] };
const bandRects = computed<BandRect[]>(() => (props.bands ?? [])
  .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
  .map((b, i) => {
    const p1 = valuePos(b.from);
    const p2 = valuePos(b.to);
    return isVertical.value
      ? { key: i, x: MARGIN.left, y: Math.min(p1, p2), width: plotWidth.value, height: Math.max(Math.abs(p2 - p1), 0.5), label: b.label, tone: b.tone }
      : { key: i, x: Math.min(p1, p2), y: MARGIN.top, width: Math.max(Math.abs(p2 - p1), 0.5), height: plotHeight.value, label: b.label, tone: b.tone };
  }));

type RefLine = { key: number; x1: number; x2: number; y1: number; y2: number; label?: string; tone?: ChartReferenceLine['tone'] };
const refLines = computed<RefLine[]>(() => (props.referenceLines ?? [])
  .filter((r) => Number.isFinite(r.value))
  .map((r, i) => {
    const p = valuePos(r.value);
    return isVertical.value
      ? { key: i, x1: MARGIN.left, x2: MARGIN.left + plotWidth.value, y1: p, y2: p, label: r.label, tone: r.tone }
      : { key: i, x1: p, x2: p, y1: MARGIN.top, y2: MARGIN.top + plotHeight.value, label: r.label, tone: r.tone };
  }));

const goalGeom = computed(() => (goal.value ? { p: valuePos(goal.value.value), label: goal.value.label, value: goal.value.value } : null));

type ErrGeom = {
  key: string;
  stem: { x1: number; y1: number; x2: number; y2: number };
  capLow: { x1: number; y1: number; x2: number; y2: number };
  capHigh: { x1: number; y1: number; x2: number; y2: number };
};
const errorBarGeom = computed<ErrGeom[]>(() => {
  const result: ErrGeom[] = [];
  for (const bar of bars.value) {
    const { errorLow, errorHigh } = bar.datum;
    const hasLow = errorLow !== undefined && Number.isFinite(errorLow);
    const hasHigh = errorHigh !== undefined && Number.isFinite(errorHigh);
    if (!hasLow && !hasHigh) continue;
    const lowV = hasLow ? (errorLow as number) : bar.datum.value;
    const highV = hasHigh ? (errorHigh as number) : bar.datum.value;
    const lowP = valuePos(lowV);
    const highP = valuePos(highV);
    const cap = 4;
    if (isVertical.value) {
      const cx = bar.x + bar.width / 2;
      result.push({
        key: bar.datum.label,
        stem: { x1: cx, y1: lowP, x2: cx, y2: highP },
        capLow: { x1: cx - cap, y1: lowP, x2: cx + cap, y2: lowP },
        capHigh: { x1: cx - cap, y1: highP, x2: cx + cap, y2: highP },
      });
    } else {
      const cy = bar.y + bar.height / 2;
      result.push({
        key: bar.datum.label,
        stem: { x1: lowP, y1: cy, x2: highP, y2: cy },
        capLow: { x1: lowP, y1: cy - cap, x2: lowP, y2: cy + cap },
        capHigh: { x1: highP, y1: cy - cap, x2: highP, y2: cy + cap },
      });
    }
  }
  return result;
});

function categoryPixel(v: number | string): number | null {
  const bar = bars.value.find((b) => b.datum.label === String(v));
  if (!bar) return null;
  return isVertical.value ? bar.cx - MARGIN.left : bar.cy - MARGIN.top;
}
function valuePixelRel(v: number): number | null {
  if (!Number.isFinite(v)) return null;
  return valuePos(v) - (isVertical.value ? MARGIN.top : MARGIN.left);
}
function transposeAnnotations(list: ChartAnnotation[] | undefined): ChartAnnotation[] | undefined {
  if (!list || isVertical.value) return list;
  return list.map((a): ChartAnnotation => {
    switch (a.kind) {
      case 'line':
        return { ...a, axis: a.axis === 'x' ? 'y' : 'x' };
      case 'region':
        return { ...a, axis: a.axis === 'x' ? 'y' : 'x' };
      case 'point':
        return { ...a, x: a.y, y: typeof a.x === 'number' ? a.x : NaN } as ChartAnnotation;
      case 'label':
        return { ...a, x: a.y, y: typeof a.x === 'number' ? a.x : NaN } as ChartAnnotation;
      case 'shape':
        return { ...a, points: a.points.map((p) => ({ x: p.y, y: typeof p.x === 'number' ? p.x : NaN })) };
    }
  });
}
const annXScale = (v: number | string): number | null =>
  isVertical.value ? categoryPixel(v) : typeof v === 'number' ? valuePixelRel(v) : null;
const annYScale = (v: number): number | null => (isVertical.value ? valuePixelRel(v) : categoryPixel(v));
const resolvedAnnotations = computed(() => resolveAnnotations(transposeAnnotations(props.annotations), {
  xScale: annXScale,
  yScale: annYScale,
  plotLeft: MARGIN.left,
  plotTop: MARGIN.top,
  plotWidth: plotWidth.value,
  plotHeight: plotHeight.value,
}));
const annotationRegions = computed(() => resolvedAnnotations.value.filter((a) => a.kind === 'region'));
const annotationAbove = computed(() => resolvedAnnotations.value.filter((a) => a.kind !== 'region'));

type DataLabelItem = { key: string; x: number; y: number; text: string; anchor: 'start' | 'middle' | 'end'; baseline: string };
const dataLabelItems = computed<DataLabelItem[]>(() => {
  const dataLabelOpts = normalizeDataLabels(props.dataLabels);
  if (!dataLabelOpts.enabled) return [];
  return bars.value.map((bar) => {
    const text = formatDataLabel(bar.datum.value, dataLabelOpts, formatTick);
    const pos = dataLabelOpts.position ?? 'outside';
    const inside = pos === 'inside' || pos === 'center';
    if (isVertical.value) {
      const x = bar.cx;
      const y = inside ? bar.y + bar.height / 2 : bar.cy - 6;
      return { key: bar.datum.label, x, y, text, anchor: 'middle' as const, baseline: inside ? 'middle' : 'auto' };
    }
    const y = bar.cy;
    const x = inside ? bar.x + bar.width / 2 : bar.cx + 4;
    return { key: bar.datum.label, x, y, text, anchor: inside ? ('middle' as const) : ('start' as const), baseline: 'middle' };
  });
});

const dataValueItems = computed(() => [
  ...data.value.map((d) => `${d.label}: ${d.value}`),
  ...overlayDataListItems({ referenceLines: props.referenceLines, bands: props.bands, goalLine: goal.value, trend: null }),
  ...annotationDataListItems(props.annotations),
]);

const hoverKeys = computed(() => bars.value.map((b) => b.datum.label));
function emitHoverKey(index: number | null) {
  props.onHoverKeyChange?.(index == null ? null : hoverKeys.value[index] ?? null);
}
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
const activeIndex = computed(() => resolveActiveIndex(props.hoverKey, hoveredIndex.value, hoverKeys.value));
const hoveredBar = computed(() => (activeIndex.value >= 0 ? bars.value[activeIndex.value] : undefined));
const tooltipStyle = computed(() =>
  hoveredBar.value
    ? `left: ${(hoveredBar.value.cx / width.value) * 100}%; top: ${(hoveredBar.value.cy / height.value) * 100}%`
    : '');

const navEnabled = computed(() => (props.keyboardNav === true || props.onSelectKey !== undefined) && bars.value.length > 0);
function focusDatum(index: number) {
  focusedIndex.value = index;
  datapointRefs[index]?.focus();
  emitHoverKey(index);
}
function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
  const action = datapointNavAction(event.key, index, bars.value.length);
  if (!action) return;
  event.preventDefault();
  if (action.kind === 'move') {
    focusDatum(action.index);
  } else if (action.kind === 'select') {
    props.onSelectKey?.(bars.value[index].datum.label);
  } else {
    focusedIndex.value = -1;
    emitHoverKey(null);
    props.onSelectKey?.(null);
    (event.currentTarget as SVGElement).blur();
  }
}
function setNavRef(el: unknown, index: number) {
  datapointRefs[index] = el as SVGRectElement | null;
}
function barClick(key: string) {
  if (interactive.value) props.onSelect?.(key);
}
function barClass(bar: Bar): string {
  const isSelected = selectedSet.value.has(bar.datum.label);
  return classNames(
    'st-barChart__bar',
    `st-barChart__bar--${bar.tone}`,
    isSelected && 'st-barChart__bar--selected',
    hasSelection.value && !isSelected && 'st-barChart__bar--dim',
    interactive.value && 'st-barChart__bar--interactive',
  );
}
function filterClass(bar: Bar): string {
  const isSelected = selectedSet.value.has(bar.datum.label);
  return classNames(
    'st-barChart__filterChip',
    `st-barChart__filterChip--${bar.tone}`,
    isSelected && 'st-barChart__filterChip--selected',
  );
}
function gridLine(tick: number) {
  if (isVertical.value) {
    const y = MARGIN.top + plotHeight.value * (1 - valueFraction(tick));
    return { x1: MARGIN.left, x2: MARGIN.left + plotWidth.value, y1: y, y2: y, tx: MARGIN.left - 6, ty: y, anchor: 'end', baseline: 'middle' };
  }
  const x = MARGIN.left + plotWidth.value * valueFraction(tick);
  return { x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + plotHeight.value, tx: x, ty: height.value - MARGIN.bottom + 16, anchor: 'middle', baseline: undefined as string | undefined };
}
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-barChart', props.class)) }" >
    <div
      class="st-barChart__visual"
      role="img"
      :aria-label="label"
      @pointermove="handleVisualPointerMove"
      @pointerleave="handleLeave"
    >
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <template v-for="tick in ticks" :key="tick">
          <line
            class="st-barChart__grid"
            :x1="gridLine(tick).x1" :x2="gridLine(tick).x2" :y1="gridLine(tick).y1" :y2="gridLine(tick).y2"
          />
          <text
            class="st-barChart__tickLabel"
            :x="gridLine(tick).tx" :y="gridLine(tick).ty"
            :text-anchor="gridLine(tick).anchor" :dominant-baseline="gridLine(tick).baseline"
          >{{ formatTick(tick) }}</text>
        </template>
        <line class="st-barChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-barChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <template v-for="bar in bars" :key="`c${bar.datum.label}`">
          <text
            v-if="isVertical"
            class="st-barChart__categoryLabel"
            :x="bar.x + bar.width / 2" :y="height - MARGIN.bottom + 16" text-anchor="middle"
          >{{ bar.datum.label }}</text>
          <text
            v-else
            class="st-barChart__categoryLabel"
            :x="MARGIN.left - 6" :y="bar.y + bar.height / 2" text-anchor="end" dominant-baseline="middle"
          >{{ bar.datum.label }}</text>
        </template>
        <template v-for="b in bandRects" :key="`band${b.key}`">
          <rect
            :class="classNames('st-barChart__band', overlayToneClass('st-barChart__band', b.tone))"
            :x="b.x" :y="b.y" :width="b.width" :height="b.height"
          />
          <text v-if="b.label" class="st-barChart__overlayLabel" :x="b.x + 4" :y="b.y + 11">{{ b.label }}</text>
        </template>
        <template v-for="r in refLines" :key="`ref${r.key}`">
          <line
            :class="classNames('st-barChart__refLine', overlayToneClass('st-barChart__refLine', r.tone))"
            :x1="r.x1" :x2="r.x2" :y1="r.y1" :y2="r.y2"
          />
          <text
            v-if="r.label"
            class="st-barChart__overlayLabel"
            :x="isVertical ? valueAxisEnd - 4 : r.x1 + 4"
            :y="isVertical ? r.y1 - 4 : MARGIN.top + 11"
            :text-anchor="isVertical ? 'end' : 'start'"
          >{{ r.label }}</text>
        </template>
        <g v-if="annotationRegions.length > 0" class="st-barChart__annotations st-barChart__annotations--behind">
          <template v-for="a in annotationRegions" :key="`ann-region-${a.key}`">
            <rect class="st-barChart__annotationRegion" :x="a.x" :y="a.y" :width="a.width" :height="a.height" />
            <text v-if="a.label" class="st-barChart__annotationLabel" :x="a.x + 4" :y="a.y + 11">{{ a.label }}</text>
          </template>
        </g>
        <rect
          v-for="(bar, i) in bars"
          :key="`b${bar.datum.label}`"
          :class="barClass(bar)"
          :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height"
          rx="2"
          :data-chart-index="i"
          @click="barClick(bar.datum.label)"
        />
        <g v-for="e in errorBarGeom" :key="`err${e.key}`" class="st-barChart__errorBar">
          <line class="st-barChart__errorStem" :x1="e.stem.x1" :y1="e.stem.y1" :x2="e.stem.x2" :y2="e.stem.y2" />
          <line class="st-barChart__errorCap" :x1="e.capLow.x1" :y1="e.capLow.y1" :x2="e.capLow.x2" :y2="e.capLow.y2" />
          <line class="st-barChart__errorCap" :x1="e.capHigh.x1" :y1="e.capHigh.y1" :x2="e.capHigh.x2" :y2="e.capHigh.y2" />
        </g>
        <template v-if="goalGeom">
          <line
            v-if="isVertical"
            class="st-barChart__goalLine"
            :x1="MARGIN.left" :x2="MARGIN.left + plotWidth" :y1="goalGeom.p" :y2="goalGeom.p"
          />
          <line
            v-else
            class="st-barChart__goalLine"
            :x1="goalGeom.p" :x2="goalGeom.p" :y1="MARGIN.top" :y2="MARGIN.top + plotHeight"
          />
          <text
            class="st-barChart__goalLabel"
            :x="isVertical ? MARGIN.left + plotWidth - 4 : goalGeom.p + 4"
            :y="isVertical ? goalGeom.p - 4 : MARGIN.top + 11"
            :text-anchor="isVertical ? 'end' : 'start'"
          >{{ goalGeom.label ?? `Objectif ${goalGeom.value}` }}</text>
        </template>
        <g v-if="annotationAbove.length > 0" class="st-barChart__annotations st-barChart__annotations--above">
          <template v-for="a in annotationAbove" :key="a.key">
            <template v-if="a.kind === 'line'">
              <line class="st-barChart__annotationLine" :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" />
              <text
                v-if="a.label"
                class="st-barChart__annotationLabel"
                :x="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4"
                :y="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                :text-anchor="a.axis === 'x' ? 'start' : 'end'"
              >{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'shape'">
              <polygon class="st-barChart__annotationShape" :points="polygonPoints(a.points)" />
              <text v-if="a.label" class="st-barChart__annotationLabel" :x="a.labelX" :y="a.labelY" text-anchor="middle">{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'point'">
              <circle class="st-barChart__annotationPoint" :cx="a.x" :cy="a.y" r="4.5" />
              <text v-if="a.label" class="st-barChart__annotationLabel" :x="a.x" :y="a.y - 8" text-anchor="middle">{{ a.label }}</text>
            </template>
            <text v-else class="st-barChart__annotationText" :x="a.x" :y="a.y" :text-anchor="a.anchor">{{ a.text }}</text>
          </template>
        </g>
        <g v-if="dataLabelItems.length > 0" class="st-barChart__dataLabels" aria-hidden="true">
          <text
            v-for="d in dataLabelItems"
            :key="`dl-${d.key}`"
            class="st-barChart__dataLabel"
            :x="d.x" :y="d.y" :text-anchor="d.anchor" :dominant-baseline="d.baseline"
          >{{ d.text }}</text>
        </g>
        <g v-if="hoveredBar" class="st-barChart__crosshair" aria-hidden="true">
          <line
            v-if="isVertical"
            class="st-barChart__crosshairLine"
            :x1="hoveredBar.cx" :x2="hoveredBar.cx" :y1="MARGIN.top" :y2="MARGIN.top + plotHeight"
          />
          <line
            v-else
            class="st-barChart__crosshairLine"
            :x1="MARGIN.left" :x2="MARGIN.left + plotWidth" :y1="hoveredBar.cy" :y2="hoveredBar.cy"
          />
        </g>
      </svg>
      <svg
        v-if="navEnabled"
        class="st-barChart__navLayer"
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        role="group"
        :aria-label="`${label} — points de données`"
      >
        <rect
          v-for="(bar, i) in bars"
          :key="`nav${bar.datum.label}`"
          :ref="(el) => setNavRef(el, i)"
          class="st-barChart__navDatum"
          :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height"
          role="img"
          :tabindex="rovingTabIndex(i, focusedIndex, bars.length)"
          :aria-label="datapointAriaLabel(bar.datum.label, bar.datum.value)"
          @keydown="handleDatapointKeyDown($event, i)"
          @focus="focusedIndex = i, emitHoverKey(i)"
        />
      </svg>
    </div>
    <div v-if="interactive" class="st-barChart__filters" role="group" :aria-label="`Filtrer par ${label}`">
      <button
        v-for="bar in bars"
        :key="`f${bar.datum.label}`"
        type="button"
        :class="filterClass(bar)"
        :aria-pressed="selectedSet.has(bar.datum.label) ? 'true' : 'false'"
        @click="barClick(bar.datum.label)"
      >
        <span class="st-barChart__filterSwatch" aria-hidden="true" />{{ `${bar.datum.label}: ${bar.datum.value}` }}
      </button>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredBar" class="st-barChart__tooltip" role="presentation" :style="tooltipStyle">
      <span class="st-barChart__tooltipLabel">{{ hoveredBar.datum.label }}</span>
      <span class="st-barChart__tooltipValue">{{ String(hoveredBar.datum.value) }}</span>
    </div>
  </div>
</template>

