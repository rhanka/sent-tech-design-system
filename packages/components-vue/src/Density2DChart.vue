<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type Density2DTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type Density2DChartScale = 'categorical' | 'sequential';

export type Density2DPoint = {
  x: number;
  y: number;
  weight?: number;
};

export type Density2DChartProps = {
  data: Density2DPoint[];
  bins?: number;
  scale?: Density2DChartScale;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 };
const TONES: Density2DTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

const normalizedScale = (value: Density2DChartScale | undefined): Density2DChartScale =>
  value === 'categorical' ? 'categorical' : 'sequential';

// Continuous scale: density normalised 0..max → category1..8 (shared with
// HeatmapChart). max ≤ 0 or non-finite density → category1 (floor intensity).
const toneForDensity = (density: number, densityMax: number): Density2DTone => {
  if (!Number.isFinite(density) || densityMax <= 0) return 'category1';
  const ratio = Math.max(0, Math.min(1, density / densityMax));
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(ratio * TONES.length)));
  return TONES[index];
};

const niceTicks = (min: number, max: number, target = 5): number[] => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [Number.isFinite(max) ? max : 0];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
};

const scaleLinear = (v: number, d0: number, d1: number, r0: number, r1: number): number => {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
};

const formatTick = (v: number): string => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

type Bin = {
  key: string;
  ix: number;
  iy: number;
  density: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  tone: Density2DTone;
};

defineOptions({ name: 'Density2DChart', inheritAttrs: false });
const props = withDefaults(defineProps<Density2DChartProps>(), {
  data: () => [],
  bins: 12,
  scale: 'sequential',
  label: undefined,
  width: undefined,
  height: 320,
  size: undefined,
  class: undefined,
});

const hoveredKey = ref<string | null>(null);

const handleLeave = () => {
  hoveredKey.value = null;
};

const handlePointerMove = (event: PointerEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredKey.value = null;
    return;
  }
  hoveredKey.value = target.getAttribute('data-chart-key');
};

const data = computed(() => props.data ?? []);
const label = computed(() => props.label);
const height = computed(() => props.height ?? 320);
const resolvedWidth = computed(() => props.width ?? props.size ?? 640);
const resolvedScale = computed(() => normalizedScale(props.scale));

const plotWidth = computed(() => Math.max(resolvedWidth.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

// Effective bin count: integer ≥ 1, capped to stay legible.
const binCount = computed(() =>
  Math.max(1, Math.min(40, Math.floor(Number.isFinite(props.bins) ? props.bins : 12))),
);

// Normalise: keep only finite-coordinate points.
const validData = computed(() => data.value.filter((d) => d && Number.isFinite(d.x) && Number.isFinite(d.y)));

// Extent [minX,maxX]×[minY,maxY] + nice ticks for the axes.
const xs = computed(() => validData.value.map((d) => d.x));
const ys = computed(() => validData.value.map((d) => d.y));
const xTicks = computed(() => niceTicks(xs.value.length ? Math.min(...xs.value) : 0, xs.value.length ? Math.max(...xs.value) : 1));
const yTicks = computed(() => niceTicks(ys.value.length ? Math.min(...ys.value) : 0, ys.value.length ? Math.max(...ys.value) : 1));
const xMin = computed(() => xTicks.value[0]);
const xMax = computed(() => xTicks.value[xTicks.value.length - 1]);
const yMin = computed(() => yTicks.value[0]);
const yMax = computed(() => yTicks.value[yTicks.value.length - 1]);

// Regular binning: binCount×binCount grid over the extent; each point
// falls into a cell, whose density = sum of weights (default 1).
const built = computed(() => {
  let densityMax = 0;
  const binCells: Bin[] = [];
  const count = binCount.value;
  if (validData.value.length > 0 && xMax.value !== xMin.value && yMax.value !== yMin.value) {
    const counts = new Float64Array(count * count);
    const idx = (ix: number, iy: number): number => iy * count + ix;
    for (const d of validData.value) {
      const fx = (d.x - xMin.value) / (xMax.value - xMin.value);
      const fy = (d.y - yMin.value) / (yMax.value - yMin.value);
      const ix = Math.max(0, Math.min(count - 1, Math.floor(fx * count)));
      const iy = Math.max(0, Math.min(count - 1, Math.floor(fy * count)));
      const w = typeof d.weight === 'number' && Number.isFinite(d.weight) ? d.weight : 1;
      counts[idx(ix, iy)] += w;
    }
    for (let i = 0; i < counts.length; i++) densityMax = Math.max(densityMax, counts[i]);

    const cellW = plotWidth.value / count;
    const cellH = plotHeight.value / count;
    for (let iy = 0; iy < count; iy++) {
      for (let ix = 0; ix < count; ix++) {
        const density = counts[idx(ix, iy)];
        if (density <= 0) continue;
        const x = MARGIN.left + ix * cellW;
        const y = MARGIN.top + (count - 1 - iy) * cellH;
        binCells.push({
          key: `${ix}-${iy}`,
          ix,
          iy,
          density,
          x,
          y,
          width: Math.max(cellW - 1, 1),
          height: Math.max(cellH - 1, 1),
          cx: x + cellW / 2,
          cy: y + cellH / 2,
          x0: xMin.value + (ix / count) * (xMax.value - xMin.value),
          x1: xMin.value + ((ix + 1) / count) * (xMax.value - xMin.value),
          y0: yMin.value + (iy / count) * (yMax.value - yMin.value),
          y1: yMin.value + ((iy + 1) / count) * (yMax.value - yMin.value),
          tone: toneForDensity(density, densityMax),
        });
      }
    }
  }
  return { binCells, densityMax };
});
const binCells = computed(() => built.value.binCells);

const xAxisTicks = computed(() => xTicks.value.map((t) => ({
  value: t,
  x: MARGIN.left + scaleLinear(t, xMin.value, xMax.value, 0, plotWidth.value),
})));
const yAxisTicks = computed(() => yTicks.value.map((t) => ({
  value: t,
  y: MARGIN.top + scaleLinear(t, yMin.value, yMax.value, plotHeight.value, 0),
})));

const dataValueItems = computed(() => binCells.value.map(
  (b) => `[${formatTick(b.x0)}–${formatTick(b.x1)}] × [${formatTick(b.y0)}–${formatTick(b.y1)}]: ${b.density}`,
));

const legendItems = computed(() => TONES.map((tone) => ({ tone })));
const hasLegend = computed(() => binCells.value.length > 0);

const hoveredCell = computed(() =>
  hoveredKey.value !== null ? binCells.value.find((b) => b.key === hoveredKey.value) ?? null : null,
);

const isCellDim = (cell: Bin): boolean => hoveredKey.value !== null && hoveredKey.value !== cell.key;
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-density2DChart', `st-density2DChart--${resolvedScale}`, props.class)) }" >
    <div class="st-density2DChart__visual" role="img" :aria-label="label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${resolvedWidth} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <text v-for="tick in yAxisTicks" :key="`y${tick.value}`" class="st-density2DChart__tickLabel" :x="MARGIN.left - 8" :y="tick.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick.value) }}</text>
        <text v-for="tick in xAxisTicks" :key="`x${tick.value}`" class="st-density2DChart__tickLabel" :x="tick.x" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(tick.value) }}</text>
        <line class="st-density2DChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
        <line class="st-density2DChart__axis" :x1="MARGIN.left" :x2="resolvedWidth - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom"></line>
        <rect v-for="cell in binCells" :key="cell.key" :class="classNames('st-density2DChart__cell', `st-density2DChart__cell--${cell.tone}`, isCellDim(cell) ? 'st-density2DChart__cell--dim' : undefined)" :x="cell.x" :y="cell.y" :width="cell.width" :height="cell.height" rx="1" :data-chart-key="cell.key"></rect>
      </svg>
    </div>
    <div v-if="hasLegend" class="st-density2DChart__legend" aria-hidden="true">
      <span class="st-density2DChart__legendText">Low</span>
      <span class="st-density2DChart__legendRamp"><span v-for="item in legendItems" :key="item.tone" :class="`st-density2DChart__legendSwatch st-density2DChart__legendSwatch--${item.tone}`"></span></span>
      <span class="st-density2DChart__legendText">High</span>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label ?? 'density 2d'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredCell" class="st-density2DChart__tooltip" role="presentation" :style="`left:${(hoveredCell.cx / resolvedWidth) * 100}%;top:${(hoveredCell.cy / height) * 100}%`">
      <span class="st-density2DChart__tooltipLabel">{{ `[${formatTick(hoveredCell.x0)}–${formatTick(hoveredCell.x1)}] × [${formatTick(hoveredCell.y0)}–${formatTick(hoveredCell.y1)}]` }}</span>
      <span class="st-density2DChart__tooltipValue">{{ `${hoveredCell.density}` }}</span>
    </div>
  </div>
</template>
