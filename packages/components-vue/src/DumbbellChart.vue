<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { CHART_MARGIN, formatTick, niceTicks, scaleLinear } from './chartScale.js';
import GraphLegend from './GraphLegend.vue';

export type DumbbellChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type DumbbellChartDatum = {
  category: string;
  low: number;
  high: number;
};

export type DumbbellChartProps = {
  data: DumbbellChartDatum[];
  width?: number;
  height?: number;
  lowTone?: DumbbellChartTone;
  highTone?: DumbbellChartTone;
  lowLabel?: string;
  highLabel?: string;
  label: string;
  class?: string;
};

// Categories sit on the vertical axis (one row each); the value axis is
// horizontal. A wider left margin holds the category labels.
const MARGIN = { ...CHART_MARGIN, left: 96, right: 20, top: 16 };
const DOT_RADIUS = 5;

// Normalise a datum: finite low/high, ordered (lo <= hi).
const normalize = (d: DumbbellChartDatum): { lo: number; hi: number } | null => {
  if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
};

defineOptions({ name: 'DumbbellChart', inheritAttrs: false });
const props = withDefaults(defineProps<DumbbellChartProps>(), {
  data: () => [],
  width: 480,
  height: 240,
  lowTone: 'category1',
  highTone: 'category2',
  lowLabel: 'Bas',
  highLabel: 'Haut',
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
const lowTone = computed(() => props.lowTone ?? 'category1');
const highTone = computed(() => props.highTone ?? 'category2');
const lowLabel = computed(() => props.lowLabel ?? 'Bas');
const highLabel = computed(() => props.highLabel ?? 'Haut');
const label = computed(() => props.label);

const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

// Valid data: finite low + high.
const validData = computed(() => (props.data ?? []).filter((d) => normalize(d) !== null));

const dataValueItems = computed(() => validData.value.map((d) => {
  const r = normalize(d)!;
  return `${d.category}: ${r.lo} – ${r.hi}`;
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

type DumbbellRow = {
  datum: DumbbellChartDatum;
  range: { lo: number; hi: number };
  cy: number;
  xLow: number;
  xHigh: number;
  index: number;
};
const rows = computed<DumbbellRow[]>(() => {
  if (validData.value.length === 0) return [];
  const band = plotHeight.value / validData.value.length;
  return validData.value.map((d, i) => {
    const r = normalize(d)!;
    const cy = MARGIN.top + band * (i + 0.5);
    const xLow = MARGIN.left + scaleLinear(r.lo, xDomain.value.min, xDomain.value.max, 0, plotWidth.value);
    const xHigh = MARGIN.left + scaleLinear(r.hi, xDomain.value.min, xDomain.value.max, 0, plotWidth.value);
    return { datum: d, range: r, cy, xLow, xHigh, index: i };
  });
});

const gridLines = computed(() => xTicks.value.map((tick) => ({
  value: tick,
  x: MARGIN.left + scaleLinear(tick, xDomain.value.min, xDomain.value.max, 0, plotWidth.value),
})));

const legendEntries = computed(() => [
  { label: lowLabel.value, shape: 'circle' as const, tone: lowTone.value },
  { label: highLabel.value, shape: 'circle' as const, tone: highTone.value },
]);

const hoveredRow = computed(() => (hoveredIndex.value !== null ? rows.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-dumbbellChart', props.class)) }" >
    <div class="st-dumbbellChart__visual" role="img" :aria-label="label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="g in gridLines" :key="g.value">
          <line class="st-dumbbellChart__grid" :x1="g.x" :x2="g.x" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
          <text class="st-dumbbellChart__tickLabel" :x="g.x" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(g.value) }}</text>
        </template>
        <line class="st-dumbbellChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
        <line class="st-dumbbellChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom"></line>
        <template v-for="row in rows" :key="row.index">
          <text class="st-dumbbellChart__categoryLabel" :x="MARGIN.left - 8" :y="row.cy" text-anchor="end" dominant-baseline="middle" :style="`font-size: ${categoryFontSize}rem`">{{ row.datum.category }}</text>
          <line class="st-dumbbellChart__connector" :x1="row.xLow" :x2="row.xHigh" :y1="row.cy" :y2="row.cy"></line>
          <circle :class="`st-dumbbellChart__dot st-dumbbellChart__dot--low st-dumbbellChart__dot--${lowTone}`" :cx="row.xLow" :cy="row.cy" :r="DOT_RADIUS" :data-chart-index="row.index"></circle>
          <circle :class="`st-dumbbellChart__dot st-dumbbellChart__dot--high st-dumbbellChart__dot--${highTone}`" :cx="row.xHigh" :cy="row.cy" :r="DOT_RADIUS" :data-chart-index="row.index"></circle>
        </template>
      </svg>
      <GraphLegend class="st-dumbbellChart__legend" :entries="legendEntries" />
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredRow" class="st-dumbbellChart__tooltip" role="presentation" :style="`left: ${(((hoveredRow.xLow + hoveredRow.xHigh) / 2) / width) * 100}%; top: ${(hoveredRow.cy / height) * 100}%`">
      <span class="st-dumbbellChart__tooltipLabel">{{ String(hoveredRow.datum.category) }}</span>
      <span class="st-dumbbellChart__tooltipValue">{{ hoveredRow.range.lo }} – {{ hoveredRow.range.hi }}</span>
    </div>
  </div>
</template>
