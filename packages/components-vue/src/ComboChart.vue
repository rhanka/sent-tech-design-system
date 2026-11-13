<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { buildLinearPath, buildSmoothPath, formatTick, niceTicks, scaleLinear } from './chartScale.js';
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from './chartAnnotations.js';
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from './chartDataLabels.js';
import { keyForX, resolveActiveIndex } from './chartCrosshair.js';
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from './chartKeyboardNav.js';

export type ComboChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ComboChartBarSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
};

export type ComboChartLineSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
  smooth?: boolean;
};

export type ComboChartProps = {
  categories: string[];
  bars?: ComboChartBarSeries[];
  lines?: ComboChartLineSeries[];
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  /**
   * Interactive legend (FR-4). Ids/labels of bar/line series hidden from the
   * render (controlled by the parent; default = all visible). Hidden series
   * are omitted and their legend item is shown "off" (`aria-pressed`).
   * Undefined → legacy non-interactive legend, unless `onToggleSeries` is set.
   */
  hiddenSeries?: string[];
  /** Emitted on click / Enter / Space on a legend item. */
  onToggleSeries?: (seriesId: string) => void;
  /**
   * Annotation overlay in DATA space. The x coordinate is CATEGORICAL — it
   * matches a category by equality (band centre); the y coordinate (and
   * `value`/`from`/`to`) are LEFT (bar) value-axis numbers. Regions render
   * behind the bars, every other kind above. Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-datum value labels on BOTH the bars and the line points. `false`/absent
   * (default) → none. `true` → each value with the chart's numeric formatter.
   * Object → `format(value)` and/or a `position` override. Labels are
   * `aria-hidden` — the values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). The key is the CATEGORY string.
   * When provided (string or null), the crosshair tracks this key instead of the
   * chart's internal pointer hover (null ⇒ nothing shown). Absent keeps the
   * legacy uncontrolled behaviour.
   */
  hoverKey?: string | null;
  /** Emitted when the user hovers a bar/point (its CATEGORY) or leaves (`null`). */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the categories (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a focusable overlay of one column per
   * category is rendered: one tab stop, arrows move, Home/End jump, Enter/Space
   * select, Escape leaves. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /** Emitted on Enter/Space (category) or `null` on Escape. */
  onSelectKey?: (key: string | null) => void;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 12, right: 52, bottom: 32, left: 52 };

type Hover =
  | { kind: 'bar'; gi: number; si: number }
  | { kind: 'line'; li: number; pi: number }
  | null;

defineOptions({ name: 'ComboChart', inheritAttrs: false });
const props = withDefaults(defineProps<ComboChartProps>(), {
  bars: () => [],
  lines: () => [],
  leftAxisLabel: undefined,
  rightAxisLabel: undefined,
  legend: true,
  hiddenSeries: undefined,
  onToggleSeries: undefined,
  annotations: undefined,
  dataLabels: undefined,
  hoverKey: undefined,
  onHoverKeyChange: undefined,
  keyboardNav: undefined,
  onSelectKey: undefined,
  width: 480,
  height: 240,
  class: undefined,
});

const hovered = ref<Hover>(null);
// FR-5 — roving keyboard focus over the category bands (separate from hover).
const focusedIndex = ref<number>(-1);
const datapointRefs: Array<SVGRectElement | null> = [];

const hoverKeys = computed(() => categories.value.map((c) => keyForX(c)));
function emitHoverKey(index: number | null) {
  props.onHoverKeyChange?.(index == null ? null : hoverKeys.value[index] ?? null);
}
function handleLeave() {
  hovered.value = null;
  emitHoverKey(null);
}
function handleVisualPointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hovered.value = null;
    emitHoverKey(null);
    return;
  }
  const kind = target.getAttribute('data-chart-kind');
  const a = Number(target.getAttribute('data-chart-a'));
  const b = Number(target.getAttribute('data-chart-b'));
  if (kind === 'bar' && Number.isInteger(a) && Number.isInteger(b)) {
    hovered.value = { kind: 'bar', gi: a, si: b };
    emitHoverKey(a); // gi === category index
  } else if (kind === 'line' && Number.isInteger(a) && Number.isInteger(b)) {
    hovered.value = { kind: 'line', li: a, pi: b };
    emitHoverKey(b); // pi === category index
  } else {
    hovered.value = null;
    emitHoverKey(null);
  }
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);
const categories = computed(() => props.categories);
const bars = computed(() => props.bars ?? []);
const lines = computed(() => props.lines ?? []);
const leftAxisLabel = computed(() => props.leftAxisLabel);
const rightAxisLabel = computed(() => props.rightAxisLabel);
const legend = computed(() => props.legend ?? true);
const label = computed(() => props.label);

// Interactive legend is active as soon as the parent wires either prop.
const legendInteractive = computed(() => props.onToggleSeries !== undefined || props.hiddenSeries !== undefined);
const hiddenSet = computed(() => new Set(props.hiddenSeries ?? []));

const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

// Une valeur n'est « présente » que si elle est un nombre fini : un trou
// (undefined/null/NaN) reste un trou, jamais un 0 fantôme.
const hasValue = (v: number | undefined): v is number => typeof v === 'number' && Number.isFinite(v);

// Left axis (bars): include zero. Hidden series excluded so the axis
// rescales to what is visible.
const leftScale = computed(() => {
  const leftValues = bars.value.filter((s) => !hiddenSet.value.has(s.label)).flatMap((s) => s.data).filter(hasValue);
  const leftMinRaw = Math.min(0, ...(leftValues.length ? leftValues : [0]));
  const leftMaxRaw = Math.max(0, ...(leftValues.length ? leftValues : [0]));
  const leftTicks = niceTicks(leftMinRaw, leftMaxRaw, 5);
  return { ticks: leftTicks, domainMin: leftTicks[0], domainMax: leftTicks[leftTicks.length - 1] };
});

// Right axis (lines): padded domain.
const rightScale = computed(() => {
  const rightValues = lines.value.filter((s) => !hiddenSet.value.has(s.label)).flatMap((s) => s.data).filter(hasValue);
  if (rightValues.length === 0) {
    const ticks = niceTicks(0, 1, 5);
    return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
  }
  const minRaw = Math.min(...rightValues);
  const maxRaw = Math.max(...rightValues);
  const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
  const ticks = niceTicks(minRaw - padded, maxRaw + padded, 5);
  return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
});

function bandCenter(i: number): number {
  const band = plotWidth.value / Math.max(categories.value.length, 1);
  return MARGIN.left + band * (i + 0.5);
}

type BarSeg = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  value: number;
  seriesLabel: string;
  category: string;
  tone: string;
};

const barGroups = computed<(BarSeg | null)[][]>(() => {
  if (categories.value.length === 0 || bars.value.length === 0) return [];
  const { domainMin, domainMax } = leftScale.value;
  const band = plotWidth.value / categories.value.length;
  const groupWidth = band * 0.62;
  const barWidth = groupWidth / bars.value.length;
  const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight.value, 0);
  return categories.value.map((_, ci) => {
    const groupX = MARGIN.left + band * ci + (band - groupWidth) / 2;
    return bars.value.map((series, si) => {
      if (hiddenSet.value.has(series.label)) return null;
      const value = series.data[ci];
      if (!hasValue(value)) return null; // trou : pas de barre fantôme à 0.
      const valueY = scaleLinear(value, domainMin, domainMax, plotHeight.value, 0);
      const y = Math.min(valueY, zeroY);
      const hh = Math.abs(zeroY - valueY);
      return {
        x: groupX + barWidth * si,
        y: MARGIN.top + y,
        width: barWidth,
        height: Math.max(hh, 0.5),
        cx: groupX + barWidth * (si + 0.5),
        cy: MARGIN.top + valueY,
        value,
        seriesLabel: series.label,
        category: categories.value[ci],
        tone: series.tone ?? `category${(si % 8) + 1}`,
      };
    });
  });
});

type LinePoint = { x: number; y: number; value: number; category: string };
type LineSeriesEntry = { path: string; points: LinePoint[]; seriesLabel: string; hidden: boolean; tone: string };
const lineSeries = computed<LineSeriesEntry[]>(() => {
  if (categories.value.length === 0 || lines.value.length === 0) return [];
  const { domainMin, domainMax } = rightScale.value;
  return lines.value.map((series, li) => {
    const points = categories.value.map((_, ci) => {
      const value = series.data[ci] ?? 0;
      return {
        x: bandCenter(ci),
        y: MARGIN.top + scaleLinear(value, domainMin, domainMax, plotHeight.value, 0),
        value,
        category: categories.value[ci],
      };
    });
    const path = series.smooth ? buildSmoothPath(points) : buildLinearPath(points);
    return {
      path,
      points,
      seriesLabel: series.label,
      hidden: hiddenSet.value.has(series.label),
      tone: series.tone ?? `category${((bars.value.length + li) % 8) + 1}`,
    };
  });
});

const leftGridLines = computed(() => leftScale.value.ticks.map((tick) => ({
  value: tick,
  y: MARGIN.top + scaleLinear(tick, leftScale.value.domainMin, leftScale.value.domainMax, plotHeight.value, 0),
})));

const rightTickEntries = computed(() =>
  lines.value.length === 0
    ? []
    : rightScale.value.ticks.map((tick) => ({
        value: tick,
        y: MARGIN.top + scaleLinear(tick, rightScale.value.domainMin, rightScale.value.domainMax, plotHeight.value, 0),
      })),
);

const legendItems = computed(() => [
  ...bars.value.map((s, i) => ({
    key: `bar-${i}`,
    label: s.label,
    tone: s.tone ?? `category${(i % 8) + 1}`,
    kind: 'bar' as const,
  })),
  ...lines.value.map((s, i) => ({
    key: `line-${i}`,
    label: s.label,
    tone: s.tone ?? `category${((bars.value.length + i) % 8) + 1}`,
    kind: 'line' as const,
  })),
]);

const dataValueItems = computed(() => [
  ...bars.value
    .filter((s) => !hiddenSet.value.has(s.label))
    .flatMap((s) => categories.value.map((c, ci) => `${s.label}, ${c}: ${s.data[ci] ?? 0}`)),
  ...lines.value
    .filter((s) => !hiddenSet.value.has(s.label))
    .flatMap((s) => categories.value.map((c, ci) => `${s.label}, ${c}: ${s.data[ci] ?? 0}`)),
  ...annotationDataListItems(props.annotations),
]);

// --- Annotation overlay -----------------------------------------------
// `xScale` matches a category by equality → its band centre (relative to
// the plot); `yScale` maps a LEFT (bar) value-axis number. Out-of-domain
// coords yield null → dropped, so an annotation never escapes the plot.
const resolvedAnnotations = computed(() => resolveAnnotations(props.annotations, {
  xScale: (v: number | string) => {
    const i = categories.value.indexOf(String(v));
    return i < 0 ? null : bandCenter(i) - MARGIN.left;
  },
  yScale: (v: number) =>
    Number.isFinite(v) ? scaleLinear(v, leftScale.value.domainMin, leftScale.value.domainMax, plotHeight.value, 0) : null,
  plotLeft: MARGIN.left,
  plotTop: MARGIN.top,
  plotWidth: plotWidth.value,
  plotHeight: plotHeight.value,
}));
const annotationRegions = computed(() => resolvedAnnotations.value.filter((a) => a.kind === 'region'));
const annotationAbove = computed(() => resolvedAnnotations.value.filter((a) => a.kind !== 'region'));

// --- Data labels ------------------------------------------------------
// One value label per visible bar (outside) + per visible line point (top).
type DataLabelItem = { key: string; x: number; y: number; text: string; baseline: 'middle' | 'auto' };
const barDataLabelItems = computed<DataLabelItem[]>(() => {
  const dataLabelOpts = normalizeDataLabels(props.dataLabels);
  if (!dataLabelOpts.enabled) return [];
  return barGroups.value.flatMap((group, gi) =>
    group.flatMap((seg, si) => {
      if (!seg) return [];
      const inside = dataLabelOpts.position === 'inside' || dataLabelOpts.position === 'center';
      return [
        {
          key: `bar-${gi}-${si}`,
          x: seg.cx,
          y: inside ? seg.y + seg.height / 2 : seg.cy - 6,
          text: formatDataLabel(seg.value, dataLabelOpts, formatTick),
          baseline: (inside ? 'middle' : 'auto') as 'middle' | 'auto',
        },
      ];
    }),
  );
});
const lineDataLabelItems = computed<DataLabelItem[]>(() => {
  const dataLabelOpts = normalizeDataLabels(props.dataLabels);
  if (!dataLabelOpts.enabled) return [];
  return lineSeries.value.flatMap((series, li) =>
    series.hidden
      ? []
      : series.points.map((p, pi) => {
          const center = dataLabelOpts.position === 'center' || dataLabelOpts.position === 'inside';
          return {
            key: `line-${li}-${pi}`,
            x: p.x,
            y: center ? p.y : p.y - 8,
            text: formatDataLabel(p.value, dataLabelOpts, formatTick),
            baseline: (center ? 'middle' : 'auto') as 'middle' | 'auto',
          };
        }),
  );
});

// --- Crosshair + keyboard nav keys (FR-3 / FR-5) ----------------------
// The shared datum is the CATEGORY: its key is the category string.
const categorySummary = (ci: number): string =>
  [
    ...bars.value.filter((s) => !hiddenSet.value.has(s.label)),
    ...lines.value.filter((s) => !hiddenSet.value.has(s.label)),
  ]
    .map((s) => {
      const raw = s.data[ci];
      return raw == null || !Number.isFinite(raw) ? null : `${s.label}: ${raw}`;
    })
    .filter((v): v is string => v !== null)
    .join(', ');

// Category index whose crosshair is DISPLAYED: the controlled `hoverKey`
// when provided, else the internal pointer category.
const internalCategoryIndex = computed(() => {
  const hov0 = hovered.value;
  return hov0 == null ? null : hov0.kind === 'bar' ? hov0.gi : hov0.pi;
});
const activeCategoryIndex = computed(() => resolveActiveIndex(props.hoverKey, internalCategoryIndex.value, hoverKeys.value));
const crosshairX = computed(() => (activeCategoryIndex.value >= 0 ? bandCenter(activeCategoryIndex.value) : null));

// --- Keyboard navigation (FR-5) ---------------------------------------
// One focusable transparent column per category carries the roving tab stop.
const navEnabled = computed(() => (props.keyboardNav === true || props.onSelectKey !== undefined) && categories.value.length > 0);
const band = computed(() => plotWidth.value / Math.max(categories.value.length, 1));
function focusDatum(index: number) {
  focusedIndex.value = index;
  datapointRefs[index]?.focus();
  emitHoverKey(index);
}
function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
  const action = datapointNavAction(event.key, index, categories.value.length);
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
function setNavRef(el: unknown, index: number) {
  datapointRefs[index] = el as SVGRectElement | null;
}
function onNavFocus(index: number) {
  focusedIndex.value = index;
  emitHoverKey(index);
}

const tooltip = computed(() => {
  const hov = hovered.value;
  if (!hov) return null;
  if (hov.kind === 'bar') {
    const seg = barGroups.value[hov.gi]?.[hov.si];
    return seg ? { cx: seg.cx, cy: seg.cy, label: `${seg.seriesLabel} · ${seg.category}`, value: seg.value } : null;
  }
  const series = lineSeries.value[hov.li];
  const p = series?.points[hov.pi];
  return series && p ? { cx: p.x, cy: p.y, label: `${series.seriesLabel} · ${p.category}`, value: p.value } : null;
});
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-comboChart', props.class)) }" >
    <div class="st-comboChart__visual" role="img" :aria-label="label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="g in leftGridLines" :key="g.value">
          <line class="st-comboChart__grid" :x1="MARGIN.left" :x2="MARGIN.left + plotWidth" :y1="g.y" :y2="g.y"></line>
          <text class="st-comboChart__tickLabel" :x="MARGIN.left - 6" :y="g.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(g.value) }}</text>
        </template>
        <text v-for="g in rightTickEntries" :key="`rt${g.value}`" class="st-comboChart__tickLabel" :x="MARGIN.left + plotWidth + 6" :y="g.y" text-anchor="start" dominant-baseline="middle">{{ formatTick(g.value) }}</text>
        <line class="st-comboChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
        <line class="st-comboChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom"></line>
        <line v-if="lines.length > 0" class="st-comboChart__axis" :x1="MARGIN.left + plotWidth" :x2="MARGIN.left + plotWidth" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
        <text v-if="leftAxisLabel" class="st-comboChart__axisLabel" text-anchor="middle" :transform="`translate(${MARGIN.left - 40}, ${MARGIN.top + plotHeight / 2}) rotate(-90)`">{{ leftAxisLabel }}</text>
        <text v-if="rightAxisLabel" class="st-comboChart__axisLabel" text-anchor="middle" :transform="`translate(${MARGIN.left + plotWidth + 40}, ${MARGIN.top + plotHeight / 2}) rotate(90)`">{{ rightAxisLabel }}</text>
        <text v-for="(category, ci) in categories" :key="`cat${ci}`" class="st-comboChart__categoryLabel" :x="bandCenter(ci)" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ category }}</text>
        <g v-if="annotationRegions.length > 0" class="st-comboChart__annotations st-comboChart__annotations--behind">
          <template v-for="a in annotationRegions" :key="`ann-region-${a.key}`">
            <rect class="st-comboChart__annotationRegion" :x="a.x" :y="a.y" :width="a.width" :height="a.height"></rect>
            <text v-if="a.label" class="st-comboChart__annotationLabel" :x="a.x + 4" :y="a.y + 11">{{ a.label }}</text>
          </template>
        </g>
        <template v-for="(group, gi) in barGroups" :key="gi">
          <template v-for="(seg, si) in group" :key="si">
            <rect v-if="seg" :key="`bar${gi}-${si}`" :class="`st-comboChart__bar st-comboChart__bar--${seg.tone}`" :x="seg.x" :y="seg.y" :width="seg.width" :height="seg.height" rx="2" data-chart-kind="bar" :data-chart-a="gi" :data-chart-b="si"></rect>
          </template>
        </template>
        <template v-for="(series, li) in lineSeries" :key="li">
          <template v-if="!series.hidden">
            <path :key="`line${li}`" :class="`st-comboChart__line st-comboChart__line--${series.tone}`" :d="series.path" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <circle v-for="(p, pi) in series.points" :key="`dot${li}-${pi}`" :class="`st-comboChart__dot st-comboChart__dot--${series.tone}`" :cx="p.x" :cy="p.y" r="4" data-chart-kind="line" :data-chart-a="li" :data-chart-b="pi"></circle>
          </template>
        </template>
        <g v-if="annotationAbove.length > 0" class="st-comboChart__annotations st-comboChart__annotations--above">
          <template v-for="a in annotationAbove" :key="a.key">
            <template v-if="a.kind === 'line'">
              <line class="st-comboChart__annotationLine" :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2"></line>
              <text v-if="a.label" class="st-comboChart__annotationLabel" :x="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4" :y="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4" :text-anchor="a.axis === 'x' ? 'start' : 'end'">{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'shape'">
              <polygon class="st-comboChart__annotationShape" :points="polygonPoints(a.points)"></polygon>
              <text v-if="a.label" class="st-comboChart__annotationLabel" :x="a.labelX" :y="a.labelY" text-anchor="middle">{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'point'">
              <circle class="st-comboChart__annotationPoint" :cx="a.x" :cy="a.y" r="4.5"></circle>
              <text v-if="a.label" class="st-comboChart__annotationLabel" :x="a.x" :y="a.y - 8" text-anchor="middle">{{ a.label }}</text>
            </template>
            <text v-else class="st-comboChart__annotationText" :x="a.x" :y="a.y" :text-anchor="a.anchor">{{ a.text }}</text>
          </template>
        </g>
        <g v-if="barDataLabelItems.length + lineDataLabelItems.length > 0" class="st-comboChart__dataLabels" aria-hidden="true">
          <text v-for="d in [...barDataLabelItems, ...lineDataLabelItems]" :key="`dl-${d.key}`" class="st-comboChart__dataLabel" :x="d.x" :y="d.y" text-anchor="middle" :dominant-baseline="d.baseline">{{ d.text }}</text>
        </g>
        <g v-if="crosshairX !== null" class="st-comboChart__crosshair" aria-hidden="true">
          <line class="st-comboChart__crosshairLine" :x1="crosshairX" :x2="crosshairX" :y1="MARGIN.top" :y2="MARGIN.top + plotHeight"></line>
        </g>
      </svg>
      <svg v-if="navEnabled" class="st-comboChart__navLayer" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" role="group" :aria-label="`${label} — points de données`">
        <rect v-for="(category, ci) in categories" :key="`nav${ci}`" :ref="(el) => setNavRef(el, ci)" class="st-comboChart__navDatum" :x="MARGIN.left + band * ci" :y="MARGIN.top" :width="band" :height="plotHeight" role="img" :tabindex="rovingTabIndex(ci, focusedIndex, categories.length)" :aria-label="datapointAriaLabel(category, categorySummary(ci))" @keydown="handleDatapointKeyDown($event, ci)" @focus="onNavFocus(ci)"></rect>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <ul v-if="legend && legendItems.length > 0" class="st-comboChart__legend" :aria-hidden="legendInteractive ? undefined : 'true'">
      <li v-for="item in legendItems" :key="item.key" :class="classNames('st-comboChart__legendItem', legendInteractive && hiddenSet.has(item.label) && 'st-comboChart__legendItem--off')">
        <button v-if="legendInteractive" type="button" class="st-comboChart__legendButton" :aria-pressed="hiddenSet.has(item.label) ? 'true' : 'false'" @click="() => props.onToggleSeries?.(item.label)"><span :class="`st-comboChart__legendSwatch st-comboChart__legendSwatch--${item.kind} st-comboChart__legendSwatch--${item.tone}`"></span>{{ ` ${item.label}` }}</button>
        <template v-else><span :class="`st-comboChart__legendSwatch st-comboChart__legendSwatch--${item.kind} st-comboChart__legendSwatch--${item.tone}`"></span>{{ ` ${item.label}` }}</template>
      </li>
    </ul>
    <div v-if="tooltip" class="st-comboChart__tooltip" role="presentation" :style="`left: ${(tooltip.cx / width) * 100}%; top: ${(tooltip.cy / height) * 100}%`">
      <span class="st-comboChart__tooltipLabel">{{ tooltip.label }}</span>
      <span class="st-comboChart__tooltipValue">{{ String(tooltip.value) }}</span>
    </div>
  </div>
</template>
