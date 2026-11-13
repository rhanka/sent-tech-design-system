<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type ContourChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ContourChartScale = 'categorical' | 'sequential';

export type ContourChartDatum = {
  x: number;
  y: number;
  /** Valeur scalaire de la cellule : pilote la bande de couleur. */
  value: number;
};

export type ContourChartProps = {
  data: ContourChartDatum[];
  levels?: number;
  scale?: ContourChartScale;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 } as const;

const TONES: ContourChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

function normalizedScale(value: ContourChartScale | undefined): ContourChartScale {
  return value === 'categorical' ? 'categorical' : 'sequential';
}

defineOptions({ name: 'ContourChart', inheritAttrs: false });
const props = withDefaults(defineProps<ContourChartProps>(), {
  data: () => [],
  levels: 6,
  scale: 'sequential',
  label: undefined,
  width: 640,
  height: 320,
  size: undefined,
  class: undefined,
});

const hoveredKey = ref<string | null>(null);

function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredKey.value = null;
    return;
  }
  hoveredKey.value = target.getAttribute('data-chart-key');
}
function handleLeave() {
  hoveredKey.value = null;
}

const data = computed(() => props.data ?? []);
const label = computed(() => props.label ?? 'contour');
const width = computed(() => props.width ?? 640);
const height = computed(() => props.height ?? 320);
const levels = computed(() => props.levels ?? 6);
const resolvedScale = computed(() => normalizedScale(props.scale));

// Points valides : coordonnées finies, valeur finie.
const validData = computed(() =>
  data.value.filter((d) => d && Number.isFinite(d.x) && Number.isFinite(d.y) && Number.isFinite(d.value)),
);

// Nombre de paliers effectif : entier ≥ 1, plafonné à 8 (les tons disponibles).
const levelCount = computed(() => Math.max(1, Math.min(TONES.length, Math.floor(Number.isFinite(levels.value) ? levels.value : 6))));

function toneForBand(band: number): ContourChartTone {
  const toneIndex = Math.max(
    0,
    Math.min(TONES.length - 1, Math.floor((band / Math.max(levelCount.value - 1, 1)) * (TONES.length - 1))),
  );
  return TONES[toneIndex];
}

const vals = computed(() => validData.value.map((d) => d.value));
const valueMin = computed(() => (vals.value.length ? Math.min(...vals.value) : 0));
const valueMax = computed(() => (vals.value.length ? Math.max(...vals.value) : 0));

function bandOf(value: number): { band: number; tone: ContourChartTone } {
  const ratio = valueMax.value > valueMin.value ? (value - valueMin.value) / (valueMax.value - valueMin.value) : 0;
  const band = Math.max(0, Math.min(levelCount.value - 1, Math.floor(ratio * levelCount.value)));
  return { band, tone: toneForBand(band) };
}

const xs = computed(() => validData.value.map((d) => d.x));
const ys = computed(() => validData.value.map((d) => d.y));
const xValues = computed(() => Array.from(new Set(xs.value)).sort((a, b) => a - b));
const yValues = computed(() => Array.from(new Set(ys.value)).sort((a, b) => a - b));
const xIndexByValue = computed(() => new Map(xValues.value.map((value, index) => [value, index] as const)));
const yIndexByValue = computed(() => new Map(yValues.value.map((value, index) => [value, index] as const)));
const xTicks = computed(() => niceTicks(Math.min(...xs.value), Math.max(...xs.value)));
const yTicks = computed(() => niceTicks(Math.min(...ys.value), Math.max(...ys.value)));
const plotW = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotH = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));
const xMin = computed(() => xTicks.value[0]);
const xMax = computed(() => xTicks.value[xTicks.value.length - 1]);
const yMin = computed(() => yTicks.value[0]);
const yMax = computed(() => yTicks.value[yTicks.value.length - 1]);

const dx = computed(() => (xValues.value.length > 1 ? xValues.value[1] - xValues.value[0] : 1));
const dy = computed(() => (yValues.value.length > 1 ? yValues.value[1] - yValues.value[0] : 1));

// Une bande rectangulaire par cellule de grille, peinte selon sa value.
const cells = computed(() => validData.value.map((d, i) => {
  const left = MARGIN.left + scaleLinear(d.x - dx.value / 2, xMin.value, xMax.value, 0, plotW.value);
  const right = MARGIN.left + scaleLinear(d.x + dx.value / 2, xMin.value, xMax.value, 0, plotW.value);
  const top = MARGIN.top + scaleLinear(d.y + dy.value / 2, yMin.value, yMax.value, plotH.value, 0);
  const bottom = MARGIN.top + scaleLinear(d.y - dy.value / 2, yMin.value, yMax.value, plotH.value, 0);
  const { band, tone } = bandOf(d.value);
  return {
    key: `${i}`,
    datum: d,
    band,
    col: xIndexByValue.value.get(d.x) ?? 0,
    row: yIndexByValue.value.get(d.y) ?? 0,
    x: Math.min(left, right),
    y: Math.min(top, bottom),
    width: Math.abs(right - left),
    height: Math.abs(bottom - top),
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
    tone,
  };
}));

const cellByGridKey = computed(() => new Map(cells.value.map((cell) => [`${cell.col}:${cell.row}`, cell] as const)));
const contourSegments = computed(() => cells.value.flatMap((cell) => {
  const segments: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  const right = cellByGridKey.value.get(`${cell.col + 1}:${cell.row}`);
  if (right && right.band !== cell.band) {
    segments.push({
      key: `${cell.key}:right`,
      x1: cell.x + cell.width,
      y1: cell.y,
      x2: cell.x + cell.width,
      y2: cell.y + cell.height,
    });
  }
  const upper = cellByGridKey.value.get(`${cell.col}:${cell.row + 1}`);
  if (upper && upper.band !== cell.band) {
    segments.push({
      key: `${cell.key}:top`,
      x1: cell.x,
      y1: cell.y,
      x2: cell.x + cell.width,
      y2: cell.y,
    });
  }
  return segments;
}));

const dataValueItems = computed(() => validData.value.map((d) => `x ${d.x}, y ${d.y} · ${formatTick(d.value)}`));

const legendItems = computed(() => Array.from({ length: levelCount.value }, (_, band) => ({ band, tone: toneForBand(band) })));
const hasLegend = computed(() => validData.value.length > 0);

const hoveredCell = computed(() =>
  hoveredKey.value === null ? null : cells.value.find((c) => c.key === hoveredKey.value) ?? null,
);
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-contourChart', `st-contourChart--${resolvedScale}`, props.class)) }" >
    <div class="st-contourChart__visual" role="img" :aria-label="props.label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <rect v-for="cell in cells" :key="cell.key" :class="classNames('st-contourChart__cell', `st-contourChart__cell--${cell.tone}`, hoveredKey !== null && hoveredKey !== cell.key ? 'st-contourChart__cell--dim' : undefined)" :x="cell.x" :y="cell.y" :width="cell.width" :height="cell.height" :data-chart-key="cell.key"></rect>
        <line v-for="segment in contourSegments" :key="segment.key" class="st-contourChart__isoline" :x1="segment.x1" :y1="segment.y1" :x2="segment.x2" :y2="segment.y2"></line>
        <template v-for="t in yTicks" :key="t">
          <line class="st-contourChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0)" :y2="MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0)"></line>
          <text class="st-contourChart__tick" :x="MARGIN.left - 6" :y="MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0)" text-anchor="end" dominant-baseline="middle">{{ formatTick(t) }}</text>
        </template>
        <text v-for="t in xTicks" :key="`tx${t}`" class="st-contourChart__tick" :x="MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW)" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(t) }}</text>
        <line class="st-contourChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
        <line class="st-contourChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom"></line>
      </svg>
    </div>
    <div v-if="hasLegend" class="st-contourChart__legend" aria-hidden="true">
      <span class="st-contourChart__legendText">Low</span>
      <span class="st-contourChart__legendRamp"><span v-for="item in legendItems" :key="item.band" :class="classNames('st-contourChart__legendSwatch', `st-contourChart__legendSwatch--${item.tone}`)"></span></span>
      <span class="st-contourChart__legendText">High</span>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredCell" class="st-contourChart__tooltip" role="presentation" :style="{ left: `${(hoveredCell.cx / width) * 100}%`, top: `${(hoveredCell.cy / height) * 100}%` }">
      <span class="st-contourChart__tooltipLabel">{{ `x ${hoveredCell.datum.x} · y ${hoveredCell.datum.y}` }}</span>
      <span class="st-contourChart__tooltipValue">{{ formatTick(hoveredCell.datum.value) }}</span>
    </div>
  </div>
</template>
