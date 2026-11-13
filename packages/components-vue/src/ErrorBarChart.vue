<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { CHART_MARGIN, formatTick, niceTicks, scaleLinear } from './chartScale.js';
import GraphLegend from './GraphLegend.vue';

export type ErrorBarChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ErrorBarChartDatum = {
  category: string;
  value: number;
  low: number;
  high: number;
};

export type ErrorBarChartProps = {
  data: ErrorBarChartDatum[];
  width?: number;
  height?: number;
  tone?: ErrorBarChartTone;
  label: string;
  class?: string;
};

// Categories sit on the vertical axis (one row each); the value axis is
// horizontal. A wider left margin holds the category labels.
const MARGIN = { ...CHART_MARGIN, left: 96, right: 20, top: 16 };
const MARKER_RADIUS = 4;
const CAP_HALF = 5; // half-height of the perpendicular cap

// Normalise a datum: finite value/low/high, ordered (lo <= value <= hi).
const normalize = (d: ErrorBarChartDatum): { lo: number; mid: number; hi: number } | null => {
  if (!Number.isFinite(d.value) || !Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  const lo = Math.min(d.low, d.high);
  const hi = Math.max(d.low, d.high);
  const mid = Math.min(hi, Math.max(lo, d.value));
  return { lo, mid, hi };
};

defineOptions({ name: 'ErrorBarChart', inheritAttrs: false });
const props = withDefaults(defineProps<ErrorBarChartProps>(), {
  data: () => [],
  width: 480,
  height: 240,
  tone: 'category1',
  class: undefined,
});

const hoveredIndex = ref<number | null>(null);

const handleLeave = () => {
  hoveredIndex.value = null;
};
const handleVisualPointerMove = (event: PointerEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    return;
  }
  const index = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(index) ? index : null;
};

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);
const tone = computed(() => props.tone ?? 'category1');
const label = computed(() => props.label);

const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

// Valid data: finite value + low + high.
const validData = computed(() => (props.data ?? []).filter((d) => normalize(d) !== null));

const dataValueItems = computed(() => validData.value.map((d) => {
  const r = normalize(d)!;
  return `${d.category}: ${r.mid} (${r.lo} – ${r.hi})`;
}));

// Shrink the category-label font when the reserved left margin is tighter
// than the reference default, to avoid clipping (cf. lollipop fix).
const categoryFontSize = computed(() => Math.max(0.5, 0.6875 * Math.min(1, MARGIN.left / 96)));

const xTicks = computed<number[]>(() => {
  if (validData.value.length === 0) return [0];
  const lows = validData.value.map((d) => normalize(d)!.lo);
  const highs = validData.value.map((d) => normalize(d)!.hi);
  const minRaw = Math.min(...lows);
  const maxRaw = Math.max(...highs);
  const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
  return niceTicks(minRaw - padded, maxRaw + padded, 5);
});
const xDomain = computed(() => (xTicks.value.length === 0 ? { min: 0, max: 1 } : { min: xTicks.value[0], max: xTicks.value[xTicks.value.length - 1] }));

type ErrorBarRow = {
  datum: ErrorBarChartDatum;
  range: { lo: number; mid: number; hi: number };
  cy: number;
  xLow: number;
  xMid: number;
  xHigh: number;
  index: number;
};
const rows = computed<ErrorBarRow[]>(() => {
  if (validData.value.length === 0) return [];
  const band = plotHeight.value / validData.value.length;
  return validData.value.map((d, i) => {
    const r = normalize(d)!;
    const cy = MARGIN.top + band * (i + 0.5);
    const xLow = MARGIN.left + scaleLinear(r.lo, xDomain.value.min, xDomain.value.max, 0, plotWidth.value);
    const xMid = MARGIN.left + scaleLinear(r.mid, xDomain.value.min, xDomain.value.max, 0, plotWidth.value);
    const xHigh = MARGIN.left + scaleLinear(r.hi, xDomain.value.min, xDomain.value.max, 0, plotWidth.value);
    return { datum: d, range: r, cy, xLow, xMid, xHigh, index: i };
  });
});

const gridLines = computed(() => xTicks.value.map((tick) => ({
  value: tick,
  x: MARGIN.left + scaleLinear(tick, xDomain.value.min, xDomain.value.max, 0, plotWidth.value),
})));

const legendEntries = computed(() => [{ label: label.value, shape: 'circle' as const, tone: tone.value }]);

const hoveredRow = computed(() => (hoveredIndex.value !== null ? rows.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-errorBarChart', props.class)">
    <div class="st-errorBarChart__visual" role="img" :aria-label="label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="g in gridLines" :key="g.value">
          <line class="st-errorBarChart__grid" :x1="g.x" :x2="g.x" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
          <text class="st-errorBarChart__tickLabel" :x="g.x" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(g.value) }}</text>
        </template>
        <line class="st-errorBarChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
        <line class="st-errorBarChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom"></line>
        <template v-for="row in rows" :key="row.index">
          <text class="st-errorBarChart__categoryLabel" :x="MARGIN.left - 8" :y="row.cy" text-anchor="end" dominant-baseline="middle" :style="`font-size: ${categoryFontSize}rem`">{{ row.datum.category }}</text>
          <line :class="`st-errorBarChart__whisker st-errorBarChart__whisker--${tone}`" :x1="row.xLow" :x2="row.xHigh" :y1="row.cy" :y2="row.cy"></line>
          <line :class="`st-errorBarChart__cap st-errorBarChart__cap--low st-errorBarChart__cap--${tone}`" :x1="row.xLow" :x2="row.xLow" :y1="row.cy - CAP_HALF" :y2="row.cy + CAP_HALF"></line>
          <line :class="`st-errorBarChart__cap st-errorBarChart__cap--high st-errorBarChart__cap--${tone}`" :x1="row.xHigh" :x2="row.xHigh" :y1="row.cy - CAP_HALF" :y2="row.cy + CAP_HALF"></line>
          <circle :class="`st-errorBarChart__marker st-errorBarChart__marker--${tone}`" :cx="row.xMid" :cy="row.cy" :r="MARKER_RADIUS" :data-chart-index="row.index"></circle>
        </template>
      </svg>
      <GraphLegend class="st-errorBarChart__legend" :entries="legendEntries" />
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredRow" class="st-errorBarChart__tooltip" role="presentation" :style="`left: ${(hoveredRow.xMid / width) * 100}%; top: ${(hoveredRow.cy / height) * 100}%`">
      <span class="st-errorBarChart__tooltipLabel">{{ String(hoveredRow.datum.category) }}</span>
      <span class="st-errorBarChart__tooltipValue">{{ hoveredRow.range.mid }} ({{ hoveredRow.range.lo }} – {{ hoveredRow.range.hi }})</span>
    </div>
  </div>
</template>
