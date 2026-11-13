<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type ColumnPyramidChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ColumnPyramidChartDatum = {
  category: string;
  value: number;
  tone?: ColumnPyramidChartTone;
};

export type ColumnPyramidChartProps = {
  data: ColumnPyramidChartDatum[];
  width?: number;
  height?: number;
  label: string;
  /** Default tone for columns whose datum has no `tone`. */
  tone?: ColumnPyramidChartTone;
  class?: string;
};

const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };

defineOptions({ name: 'ColumnPyramidChart', inheritAttrs: false });
const props = withDefaults(defineProps<ColumnPyramidChartProps>(), {
  data: () => [],
  width: 480,
  height: 280,
  tone: 'category1',
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
const height = computed(() => props.height ?? 280);
const defaultTone = computed(() => props.tone ?? 'category1');

// Valid data: finite, strictly-positive value (a triangle sitting on the X
// axis is only meaningful for a value > 0).
const validData = computed(() =>
  (props.data ?? []).filter((d) => Number.isFinite(d.value) && d.value > 0),
);

const ticks = computed(() => {
  const values = validData.value.map((d) => d.value);
  const minRaw = 0;
  const maxRaw = Math.max(0, ...values);
  return niceTicks(minRaw, maxRaw, 5);
});
const domainMin = computed(() => (ticks.value[0] ?? 0));
const domainMax = computed(() => (ticks.value[ticks.value.length - 1] ?? 0));
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

type Column = {
  datum: ColumnPyramidChartDatum;
  tone: ColumnPyramidChartTone;
  points: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
};

const columns = computed<Column[]>(() => {
  if (validData.value.length === 0) return [];
  const band = plotWidth.value / validData.value.length;
  const baseWidth = band * 0.7;
  const zeroY = MARGIN.top + scaleLinear(0, domainMin.value, domainMax.value, plotHeight.value, 0);
  return validData.value.map((d, i) => {
    const apexY = MARGIN.top + scaleLinear(d.value, domainMin.value, domainMax.value, plotHeight.value, 0);
    const cx = MARGIN.left + band * (i + 0.5);
    const leftX = cx - baseWidth / 2;
    const rightX = cx + baseWidth / 2;
    // Triangle: wide base on the X axis, apex centred at the value height.
    const points = `${leftX},${zeroY} ${rightX},${zeroY} ${cx},${apexY}`;
    return {
      datum: d,
      tone: (d.tone ?? defaultTone.value) as ColumnPyramidChartTone,
      points,
      cx,
      cy: apexY,
      labelX: cx,
      labelY: height.value - MARGIN.bottom + 16,
    };
  });
});

const dataValueItems = computed(() => validData.value.map((d) => `${d.category}: ${d.value}`));

const valueAxisTicks = computed(() =>
  ticks.value.map((tick) => ({
    value: tick,
    x1: MARGIN.left,
    x2: MARGIN.left + plotWidth.value,
    y: MARGIN.top + scaleLinear(tick, domainMin.value, domainMax.value, plotHeight.value, 0),
  })),
);

const hovered = computed(() => (hoveredIndex.value !== null ? columns.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-columnPyramidChart', props.class)">
    <div
      class="st-columnPyramidChart__visual"
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
        <template v-for="tick in valueAxisTicks" :key="`g${tick.value}`">
          <line class="st-columnPyramidChart__grid" :x1="tick.x1" :x2="tick.x2" :y1="tick.y" :y2="tick.y" />
          <text class="st-columnPyramidChart__tickLabel" :x="MARGIN.left - 6" :y="tick.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick.value) }}</text>
        </template>
        <line class="st-columnPyramidChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-columnPyramidChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <text
          v-for="col in columns"
          :key="`cat-${col.datum.category}`"
          class="st-columnPyramidChart__categoryLabel"
          :x="col.labelX"
          :y="col.labelY"
          text-anchor="middle"
        >{{ col.datum.category }}</text>
        <polygon
          v-for="(col, i) in columns"
          :key="`col-${col.datum.category}`"
          :class="`st-columnPyramidChart__column st-columnPyramidChart__column--${col.tone}`"
          :points="col.points"
          :data-chart-index="i"
        />
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-columnPyramidChart__tooltip"
      role="presentation"
      :style="`left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`"
    >
      <span class="st-columnPyramidChart__tooltipLabel">{{ hovered.datum.category }}</span>
      <span class="st-columnPyramidChart__tooltipValue">{{ String(hovered.datum.value) }}</span>
    </div>
  </div>
</template>
