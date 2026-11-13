<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks } from './chartScale.js';

export type ColumnRangeChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ColumnRangeChartDatum = {
  category: string;
  low: number;
  high: number;
  tone?: ColumnRangeChartTone;
};

export type ColumnRangeChartProps = {
  data: ColumnRangeChartDatum[];
  width?: number;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * ColumnRangeCharts in a grid share one scale. When absent or invalid, the
   * scale falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

// Normalise a datum: finite low/high, ordered (lo <= hi).
function normalize(d: ColumnRangeChartDatum): { lo: number; hi: number } | null {
  if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
}

defineOptions({ name: 'ColumnRangeChart', inheritAttrs: false });
const props = withDefaults(defineProps<ColumnRangeChartProps>(), {
  data: () => [],
  width: 480,
  height: 240,
  orientation: 'vertical',
  domain: undefined,
  class: undefined,
});

const hoveredIndex = ref<number | null>(null);

function handleLeave() {
  hoveredIndex.value = null;
}
function handleVisualPointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    return;
  }
  const index = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(index) ? index : null;
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);
const orientation = computed(() => props.orientation ?? 'vertical');
const label = computed(() => props.label);
const data = computed(() => props.data ?? []);

const validData = computed(() => data.value.filter((d) => normalize(d) !== null));

const validDomain = computed((): [number, number] | null => {
  const domain = props.domain;
  return domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] < domain[1]
    ? [domain[0], domain[1]]
    : null;
});

const ticks = computed(() => {
  const lows = validData.value.map((d) => Math.min(d.low, d.high));
  const highs = validData.value.map((d) => Math.max(d.low, d.high));
  const minRaw = validDomain.value ? validDomain.value[0] : Math.min(...lows, ...highs);
  const maxRaw = validDomain.value ? validDomain.value[1] : Math.max(...lows, ...highs);
  return niceTicks(minRaw, maxRaw, 5);
});
const domainMin = computed(() => ticks.value[0]);
const domainMax = computed(() => ticks.value[ticks.value.length - 1]);
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

function valueFraction(v: number): number {
  if (domainMax.value === domainMin.value) return 0;
  const f = (v - domainMin.value) / (domainMax.value - domainMin.value);
  return Math.min(1, Math.max(0, f));
}

type Bar = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  datum: ColumnRangeChartDatum;
  range: { lo: number; hi: number };
  tone: ColumnRangeChartTone;
};

const bars = computed<Bar[]>(() => {
  const valid = validData.value;
  let result: Bar[] = [];
  if (valid.length !== 0) {
    if (orientation.value === 'vertical') {
      const band = plotWidth.value / valid.length;
      const barWidth = band * 0.62;
      const yOf = (v: number) => plotHeight.value * (1 - valueFraction(v));
      result = valid.map((d, i) => {
        const range = normalize(d)!;
        const yLow = yOf(range.lo);
        const yHigh = yOf(range.hi);
        const y = Math.min(yLow, yHigh);
        const hh = Math.abs(yLow - yHigh);
        const x = MARGIN.left + band * i + (band - barWidth) / 2;
        return {
          x,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(hh, 0.5),
          cx: MARGIN.left + band * (i + 0.5),
          cy: MARGIN.top + (yLow + yHigh) / 2,
          datum: d,
          range,
          tone: (d.tone ?? 'category1') as ColumnRangeChartTone,
        };
      });
    } else {
      const band = plotHeight.value / valid.length;
      const barHeight = band * 0.62;
      const xOf = (v: number) => plotWidth.value * valueFraction(v);
      result = valid.map((d, i) => {
        const range = normalize(d)!;
        const xLow = xOf(range.lo);
        const xHigh = xOf(range.hi);
        const x = Math.min(xLow, xHigh);
        const w = Math.abs(xHigh - xLow);
        const y = MARGIN.top + band * i + (band - barHeight) / 2;
        return {
          x: MARGIN.left + x,
          y,
          width: Math.max(w, 0.5),
          height: barHeight,
          cx: MARGIN.left + (xLow + xHigh) / 2,
          cy: MARGIN.top + band * (i + 0.5),
          datum: d,
          range,
          tone: (d.tone ?? 'category1') as ColumnRangeChartTone,
        };
      });
    }
  }
  return result;
});

const dataValueItems = computed(() => bars.value.map((bar) => `${bar.datum.category}: ${bar.range.lo} – ${bar.range.hi}`));

const valueAxisTicks = computed(() => ticks.value.map((tick) => {
  if (orientation.value === 'vertical') {
    return {
      value: tick,
      x1: MARGIN.left,
      x2: MARGIN.left + plotWidth.value,
      y: MARGIN.top + plotHeight.value * (1 - valueFraction(tick)),
      x: undefined as number | undefined,
      y1: undefined as number | undefined,
      y2: undefined as number | undefined,
    };
  }
  return {
    value: tick,
    x: MARGIN.left + plotWidth.value * valueFraction(tick),
    y1: MARGIN.top,
    y2: MARGIN.top + plotHeight.value,
    x1: undefined as number | undefined,
    x2: undefined as number | undefined,
    y: undefined as number | undefined,
  };
}));

const hovered = computed(() => (hoveredIndex.value !== null ? bars.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-columnRangeChart', props.class)) }" >
    <div class="st-columnRangeChart__visual" role="img" :aria-label="label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-if="orientation === 'vertical'">
          <template v-for="tick in valueAxisTicks" :key="tick.value">
            <line class="st-columnRangeChart__grid" :x1="tick.x1" :x2="tick.x2" :y1="tick.y" :y2="tick.y"></line>
            <text class="st-columnRangeChart__tickLabel" :x="MARGIN.left - 6" :y="tick.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick.value) }}</text>
          </template>
        </template>
        <template v-else>
          <template v-for="tick in valueAxisTicks" :key="tick.value">
            <line class="st-columnRangeChart__grid" :x1="tick.x" :x2="tick.x" :y1="tick.y1" :y2="tick.y2"></line>
            <text class="st-columnRangeChart__tickLabel" :x="tick.x" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(tick.value) }}</text>
          </template>
        </template>
        <line class="st-columnRangeChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
        <line class="st-columnRangeChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom"></line>
        <template v-if="orientation === 'vertical'">
          <text v-for="bar in bars" :key="`cat-${bar.datum.category}`" class="st-columnRangeChart__categoryLabel" :x="bar.x + bar.width / 2" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ bar.datum.category }}</text>
        </template>
        <template v-else>
          <text v-for="bar in bars" :key="`cat-${bar.datum.category}`" class="st-columnRangeChart__categoryLabel" :x="MARGIN.left - 6" :y="bar.y + bar.height / 2" text-anchor="end" dominant-baseline="middle">{{ bar.datum.category }}</text>
        </template>
        <rect v-for="(bar, i) in bars" :key="`bar-${bar.datum.category}`" :class="`st-columnRangeChart__bar st-columnRangeChart__bar--${bar.tone}`" :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" rx="2" :data-chart-index="i"></rect>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-columnRangeChart__tooltip" role="presentation" :style="`left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`">
      <span class="st-columnRangeChart__tooltipLabel">{{ hovered.datum.category }}</span>
      <span class="st-columnRangeChart__tooltipValue">{{ hovered.range.lo }} – {{ hovered.range.hi }}</span>
    </div>
  </div>
</template>
