<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type HeatmapChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type HeatmapChartScale = 'categorical' | 'sequential';

export type HeatmapChartDatum = {
  x: string;
  y: string;
  value: number;
  tone?: HeatmapChartTone;
};

export type HeatmapChartProps = {
  data: HeatmapChartDatum[];
  width?: number;
  height?: number;
  scale?: HeatmapChartScale;
  legend?: boolean;
  label: string;
  class?: string;
};

const MARGIN = { top: 28, right: 18, bottom: 44, left: 64 } as const;
const TONES: HeatmapChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

defineOptions({ name: 'HeatmapChart', inheritAttrs: false });
const props = withDefaults(defineProps<HeatmapChartProps>(), {
  width: 480, height: 300, scale: 'categorical', legend: false, class: undefined,
});

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

function normalizedScale(value: HeatmapChartScale | undefined): HeatmapChartScale {
  return value === 'sequential' ? 'sequential' : 'categorical';
}

function toneForValue(value: number, min: number, max: number): HeatmapChartTone {
  if (!Number.isFinite(value) || max <= min) return 'category1';
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
  return TONES[index];
}

const resolvedScale = computed(() => normalizedScale(props.scale));

const geometry = computed(() => {
  const data = props.data ?? [];
  const width = props.width ?? 480;
  const height = props.height ?? 300;
  const xLabels = uniqueInOrder(data.map((d) => d.x));
  const yLabels = uniqueInOrder(data.map((d) => d.y));
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const cellWidth = xLabels.length > 0 ? plotWidth / xLabels.length : plotWidth;
  const cellHeight = yLabels.length > 0 ? plotHeight / yLabels.length : plotHeight;
  const values = data.map((d) => d.value).filter(Number.isFinite);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 1;
  const cells = data.map((d, i) => {
    const xIndex = Math.max(0, xLabels.indexOf(d.x));
    const yIndex = Math.max(0, yLabels.indexOf(d.y));
    return {
      datum: d,
      tone: resolvedScale.value === 'sequential' ? toneForValue(d.value, min, max) : d.tone ?? toneForValue(d.value, min, max),
      x: MARGIN.left + xIndex * cellWidth,
      y: MARGIN.top + yIndex * cellHeight,
      cellWidth,
      cellHeight,
      cx: MARGIN.left + xIndex * cellWidth + cellWidth / 2,
      cy: MARGIN.top + yIndex * cellHeight + cellHeight / 2,
      index: i,
    };
  });
  return { xLabels, yLabels, plotWidth, plotHeight, width, height, cells };
});

const dataValueItems = computed(() => (props.data ?? []).map((d) => `${d.y}, ${d.x}: ${d.value}`));

const hoveredIndex = ref<number | null>(null);
const hovered = computed(() => (hoveredIndex.value !== null ? geometry.value.cells[hoveredIndex.value] : undefined));

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
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-heatmapChart', `st-heatmapChart--${resolvedScale}`, props.class)">
    <div class="st-heatmapChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${geometry.width} ${geometry.height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <text v-for="(yLabel, row) in geometry.yLabels" :key="`y${yLabel}`" class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--y" :x="MARGIN.left - 8" :y="MARGIN.top + (row + 0.5) * (geometry.plotHeight / Math.max(geometry.yLabels.length, 1))" text-anchor="end" dominant-baseline="middle">{{ yLabel }}</text>
        <text v-for="(xLabel, column) in geometry.xLabels" :key="`x${xLabel}`" class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--x" :x="MARGIN.left + (column + 0.5) * (geometry.plotWidth / Math.max(geometry.xLabels.length, 1))" :y="geometry.height - MARGIN.bottom + 20" text-anchor="middle">{{ xLabel }}</text>
        <rect class="st-heatmapChart__plot" :x="MARGIN.left" :y="MARGIN.top" :width="geometry.plotWidth" :height="geometry.plotHeight" />
        <rect v-for="(cell, i) in geometry.cells" :key="`${cell.datum.y}-${cell.datum.x}-${i}`" :class="classNames('st-heatmapChart__cell', `st-heatmapChart__cell--${cell.tone}`, hoveredIndex !== null && hoveredIndex !== i ? 'st-heatmapChart__cell--dim' : undefined)" :x="cell.x" :y="cell.y" :width="Math.max(cell.cellWidth - 2, 1)" :height="Math.max(cell.cellHeight - 2, 1)" rx="2" :data-chart-index="i" />
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-heatmapChart__tooltip" role="presentation" :style="`left: ${(hovered.cx / geometry.width) * 100}%; top: ${(hovered.cy / geometry.height) * 100}%`">
      <span class="st-heatmapChart__tooltipLabel">{{ `${hovered.datum.y}, ${hovered.datum.x}` }}</span><span class="st-heatmapChart__tooltipValue">{{ String(hovered.datum.value) }}</span>
    </div>
    <div v-if="props.legend" class="st-heatmapChart__legend" aria-hidden="true">
      <span class="st-heatmapChart__legendText">Low</span>
      <span class="st-heatmapChart__legendRamp">
        <span v-for="tone in TONES" :key="tone" :class="`st-heatmapChart__legendSwatch st-heatmapChart__legendSwatch--${tone}`"></span>
      </span>
      <span class="st-heatmapChart__legendText">High</span>
    </div>
  </div>
</template>
