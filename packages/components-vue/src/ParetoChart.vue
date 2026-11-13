<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type ParetoChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ParetoChartDatum = {
  label: string;
  value: number;
  tone?: ParetoChartTone;
};

export type ParetoChartProps = {
  data: ParetoChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

// Right margin larger than BarChart's to host the % axis labels.
const MARGIN = { top: 12, right: 44, bottom: 32, left: 44 };
const DOT_RADIUS = 4;

defineOptions({ name: 'ParetoChart', inheritAttrs: false });
const props = withDefaults(defineProps<ParetoChartProps>(), {
  width: 480, height: 240, class: undefined,
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

// Valid data: finite, non-negative value. Sorted descending by value.
const sortedData = computed(() => (props.data ?? [])
  .filter((d) => Number.isFinite(d.value) && d.value >= 0)
  .slice()
  .sort((a, b) => b.value - a.value));

const total = computed(() => sortedData.value.reduce((acc, d) => acc + d.value, 0));

const ticks = computed(() => {
  const values = sortedData.value.map((d) => d.value);
  return niceTicks(0, Math.max(0, ...values), 5);
});
const domainMin = computed(() => ticks.value[0]);
const domainMax = computed(() => ticks.value[ticks.value.length - 1]);
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

type ParetoEntry = {
  datum: ParetoChartDatum;
  tone: ParetoChartTone;
  x: number;
  y: number;
  width: number;
  height: number;
  cumPercent: number;
  cx: number;
  cy: number;
};

const entries = computed<ParetoEntry[]>(() => {
  const sorted = sortedData.value;
  if (sorted.length === 0) return [];
  const band = plotWidth.value / sorted.length;
  const barWidth = band * 0.62;
  const zeroY = scaleLinear(0, domainMin.value, domainMax.value, plotHeight.value, 0);
  let running = 0;
  return sorted.map((d, i) => {
    running += d.value;
    const cumPercent = total.value > 0 ? (running / total.value) * 100 : 0;
    const valueY = scaleLinear(d.value, domainMin.value, domainMax.value, plotHeight.value, 0);
    const y = Math.min(valueY, zeroY);
    const hh = Math.abs(zeroY - valueY);
    const x = MARGIN.left + band * i + (band - barWidth) / 2;
    // The % axis maps [0,100] over the full plot height (100% at top).
    const cy = MARGIN.top + scaleLinear(cumPercent, 0, 100, plotHeight.value, 0);
    return {
      datum: d,
      tone: (d.tone ?? 'category1') as ParetoChartTone,
      x,
      y: MARGIN.top + y,
      width: barWidth,
      height: Math.max(hh, 0.5),
      cumPercent,
      cx: MARGIN.left + band * (i + 0.5),
      cy,
    };
  });
});

const cumulativePath = computed(() => entries.value
  .map((e, i) => `${i === 0 ? 'M' : 'L'} ${e.cx} ${e.cy}`)
  .join(' '));

const dataValueItems = computed(() => entries.value.map(
  (e) => `${e.datum.label}: ${e.datum.value} (${formatTick(e.cumPercent)}% cumulé)`,
));

const valueAxisTicks = computed(() => ticks.value.map((tick) => ({
  value: tick,
  x1: MARGIN.left,
  x2: MARGIN.left + plotWidth.value,
  y: MARGIN.top + scaleLinear(tick, domainMin.value, domainMax.value, plotHeight.value, 0),
})));

// Right (percentage) axis: fixed 0–100 in 25% steps.
const percentAxisTicks = computed(() => [0, 25, 50, 75, 100].map((pct) => ({
  value: pct,
  y: MARGIN.top + scaleLinear(pct, 0, 100, plotHeight.value, 0),
})));

const hovered = computed(() => (hoveredIndex.value !== null ? entries.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-paretoChart', props.class)">
    <div
      class="st-paretoChart__visual"
      role="img"
      :aria-label="props.label"
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
        <template v-for="tick in valueAxisTicks" :key="`v-${tick.value}`">
          <line class="st-paretoChart__grid" :x1="tick.x1" :x2="tick.x2" :y1="tick.y" :y2="tick.y" />
          <text class="st-paretoChart__tickLabel" :x="MARGIN.left - 6" :y="tick.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick.value) }}</text>
        </template>
        <text v-for="tick in percentAxisTicks" :key="`p-${tick.value}`" class="st-paretoChart__percentLabel" :x="width - MARGIN.right + 6" :y="tick.y" text-anchor="start" dominant-baseline="middle">{{ `${tick.value}%` }}</text>
        <line class="st-paretoChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-paretoChart__axis" :x1="width - MARGIN.right" :x2="width - MARGIN.right" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-paretoChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <text v-for="e in entries" :key="`cat-${e.datum.label}`" class="st-paretoChart__categoryLabel" :x="e.x + e.width / 2" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ e.datum.label }}</text>
        <rect
          v-for="(e, i) in entries"
          :key="`bar-${e.datum.label}`"
          :class="`st-paretoChart__bar st-paretoChart__bar--${e.tone}`"
          :x="e.x"
          :y="e.y"
          :width="e.width"
          :height="e.height"
          rx="2"
          :data-chart-index="i"
        />
        <template v-if="entries.length > 0">
          <path class="st-paretoChart__cumLine" :d="cumulativePath" fill="none" />
          <circle
            v-for="(e, i) in entries"
            :key="`dot-${e.datum.label}`"
            class="st-paretoChart__cumDot"
            :cx="e.cx"
            :cy="e.cy"
            :r="DOT_RADIUS"
            :data-chart-index="i"
          />
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-paretoChart__tooltip"
      role="presentation"
      :style="`left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`"
    >
      <span class="st-paretoChart__tooltipLabel">{{ hovered.datum.label }}</span>
      <span class="st-paretoChart__tooltipValue">{{ `${hovered.datum.value} · ${formatTick(hovered.cumPercent)}%` }}</span>
    </div>
  </div>
</template>
