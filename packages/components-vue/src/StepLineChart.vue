<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import {
  CHART_MARGIN,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from './chartScale.js';

export type StepLineChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type StepLineChartDatum = {
  x: number | string;
  y: number;
};

export type StepLineChartProps = {
  data: StepLineChartDatum[];
  width?: number;
  height?: number;
  tone?: StepLineChartTone;
  label: string;
  class?: string;
};

const MARGIN = CHART_MARGIN;

function isValidDatum(datum: StepLineChartDatum): boolean {
  return Number.isFinite(datum.y) && (typeof datum.x === 'string' || isNumeric(datum.x));
}

function buildStepPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  let path = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const point = pts[i];
    path += ` H${point.x.toFixed(2)} V${point.y.toFixed(2)}`;
  }
  return path;
}

defineOptions({ name: 'StepLineChart', inheritAttrs: false });
const props = withDefaults(defineProps<StepLineChartProps>(), {
  width: 480, height: 240, tone: 'category1', class: undefined,
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
const tone = computed(() => props.tone ?? 'category1');
const label = computed(() => props.label);
const safeData = computed(() => props.data.filter(isValidDatum));
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

type XDomain =
  | { kind: 'ordinal'; values: (number | string)[] }
  | { kind: 'numeric'; min: number; max: number };

const xDomain = computed<XDomain>(() => {
  if (safeData.value.length === 0) return { kind: 'ordinal', values: [] };
  if (safeData.value.every((d) => isNumeric(d.x))) {
    const xs = safeData.value.map((d) => d.x as number);
    return { kind: 'numeric', min: Math.min(...xs), max: Math.max(...xs) };
  }
  return { kind: 'ordinal', values: safeData.value.map((d) => d.x) };
});

const ys = computed(() => safeData.value.map((d) => d.y));
const yTicks = computed<number[]>(() => {
  if (ys.value.length === 0) return [0];
  const minRaw = Math.min(...ys.value);
  const maxRaw = Math.max(...ys.value);
  const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
  return niceTicks(minRaw - padded, maxRaw + padded, 5);
});
const yDomain = computed(() =>
  yTicks.value.length === 0 ? { min: 0, max: 1 } : { min: yTicks.value[0], max: yTicks.value[yTicks.value.length - 1] },
);

type Point = { x: number; y: number; datum: StepLineChartDatum; index: number };
const points = computed<Point[]>(() => {
  if (safeData.value.length === 0) return [];
  return safeData.value.map((d, i) => {
    let x: number;
    if (xDomain.value.kind === 'numeric') {
      x = scaleLinear(d.x as number, xDomain.value.min, xDomain.value.max, 0, plotWidth.value);
    } else {
      const denom = Math.max(safeData.value.length - 1, 1);
      x = safeData.value.length === 1 ? plotWidth.value / 2 : (i / denom) * plotWidth.value;
    }
    const y = scaleLinear(d.y, yDomain.value.min, yDomain.value.max, plotHeight.value, 0);
    return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
  });
});

const dataValueItems = computed(() => safeData.value.map((d) => `${d.x}: ${d.y}`));
const linePath = computed(() => buildStepPath(points.value));
const gridLines = computed(() =>
  yTicks.value.map((tick) => ({
    value: tick,
    y: MARGIN.top + scaleLinear(tick, yDomain.value.min, yDomain.value.max, plotHeight.value, 0),
  })),
);

const xTickEntries = computed<{ x: number; label: string }[]>(() => {
  if (safeData.value.length === 0) return [];
  if (xDomain.value.kind === 'ordinal') {
    return points.value.map((p, i) => ({ x: p.x, label: String(safeData.value[i].x) }));
  }
  const result: { x: number; label: string }[] = [];
  const target = Math.min(5, safeData.value.length);
  const stride = Math.max(1, Math.round((safeData.value.length - 1) / (target - 1 || 1)));
  for (let i = 0; i < safeData.value.length; i += stride) {
    result.push({ x: points.value[i].x, label: String(safeData.value[i].x) });
  }
  const lastIdx = safeData.value.length - 1;
  if (result[result.length - 1]?.label !== String(safeData.value[lastIdx].x)) {
    result.push({ x: points.value[lastIdx].x, label: String(safeData.value[lastIdx].x) });
  }
  return result;
});

const hoveredPoint = computed(() =>
  hoveredIndex.value !== null ? points.value[hoveredIndex.value] : undefined,
);
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-stepLineChart', `st-stepLineChart--${tone}`, props.class)">
    <div
      class="st-stepLineChart__visual"
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
        <template v-for="g in gridLines" :key="g.value">
          <line class="st-stepLineChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="g.y" :y2="g.y" />
          <text class="st-stepLineChart__tickLabel" :x="MARGIN.left - 6" :y="g.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(g.value) }}</text>
        </template>
        <line class="st-stepLineChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-stepLineChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <text
          v-for="(tick, i) in xTickEntries"
          :key="`x${i}`"
          class="st-stepLineChart__tickLabel"
          :x="tick.x"
          :y="height - MARGIN.bottom + 16"
          text-anchor="middle"
        >{{ tick.label }}</text>
        <path v-if="linePath" class="st-stepLineChart__line" :d="linePath" fill="none" stroke-width="2" stroke-linecap="butt" stroke-linejoin="round" />
        <circle
          v-for="p in points"
          :key="p.index"
          class="st-stepLineChart__dot"
          :cx="p.x"
          :cy="p.y"
          r="4"
          :data-chart-index="p.index"
        />
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredPoint"
      class="st-stepLineChart__tooltip"
      role="presentation"
      :style="`left: ${(hoveredPoint.x / width) * 100}%; top: ${(hoveredPoint.y / height) * 100}%`"
    >
      <span class="st-stepLineChart__tooltipLabel">{{ String(hoveredPoint.datum.x) }}</span>
      <span class="st-stepLineChart__tooltipValue">{{ String(hoveredPoint.datum.y) }}</span>
    </div>
  </div>
</template>
