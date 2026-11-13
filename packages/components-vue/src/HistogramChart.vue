<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type HistogramChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type HistogramChartBin = {
  label: string;
  value: number;
  tone?: HistogramChartTone;
};

export type HistogramChartDatum = number | HistogramChartBin;

export type HistogramChartProps = {
  data: HistogramChartDatum[];
  bins?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 36, left: 44 } as const;
const TONES: HistogramChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

defineOptions({ name: 'HistogramChart', inheritAttrs: false });
const props = withDefaults(defineProps<HistogramChartProps>(), {
  bins: 10, width: 480, height: 240, class: undefined,
});

function isNumberDatum(datum: HistogramChartDatum): datum is number {
  return typeof datum === 'number';
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, '');
}

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function buildNumericBins(values: number[], count: number): HistogramChartBin[] {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return [];
  const binCount = Math.max(1, Math.floor(count));
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const step = max === min ? 1 : (max - min) / binCount;
  const out: HistogramChartBin[] = Array.from({ length: binCount }, (_, index) => {
    const start = min + step * index;
    const end = index === binCount - 1 ? max : min + step * (index + 1);
    return {
      label: `${formatNumber(start)}-${formatNumber(end)}`,
      value: 0,
      tone: TONES[index % TONES.length],
    };
  });

  for (const v of finite) {
    const index = v === max ? binCount - 1 : Math.max(0, Math.min(binCount - 1, Math.floor((v - min) / step)));
    out[index].value += 1;
  }

  return out;
}

const geometry = computed(() => {
  const data = props.data ?? [];
  const bins = props.bins ?? 10;
  const width = props.width ?? 480;
  const height = props.height ?? 240;
  const normalizedBins: HistogramChartBin[] = data.every(isNumberDatum)
    ? buildNumericBins(data as number[], bins)
    : (data as HistogramChartBin[]).map((datum, index) => ({
        label: datum.label,
        value: Number.isFinite(datum.value) ? datum.value : 0,
        tone: datum.tone ?? TONES[index % TONES.length],
      }));
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const maxValue = Math.max(0, ...normalizedBins.map((bin) => bin.value));
  const safeMax = maxValue > 0 ? maxValue : 1;
  const band = normalizedBins.length > 0 ? plotWidth / normalizedBins.length : plotWidth;
  const barWidth = Math.max(band * 0.68, 1);
  const bars = normalizedBins.map((bin, index) => {
    const h_ = scaleLinear(bin.value, 0, safeMax, 0, plotHeight);
    return {
      bin,
      x: MARGIN.left + band * index + (band - barWidth) / 2,
      y: MARGIN.top + plotHeight - h_,
      width: barWidth,
      height: Math.max(h_, 0.5),
      labelX: MARGIN.left + band * (index + 0.5),
    };
  });
  const dataValueItems = normalizedBins.map((bin) => `${bin.label}: ${bin.value}`);
  return { width, height, bars, dataValueItems };
});

const hoveredIndex = ref<number | null>(null);
const hovered = computed(() => (hoveredIndex.value !== null ? geometry.value.bars[hoveredIndex.value] : undefined));

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
  <div v-bind="{ ...($attrs), class: (classNames('st-histogramChart', props.class)) }" >
    <div class="st-histogramChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${geometry.width} ${geometry.height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <line class="st-histogramChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="geometry.height - MARGIN.bottom" />
        <line class="st-histogramChart__axis" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="geometry.height - MARGIN.bottom" :y2="geometry.height - MARGIN.bottom" />
        <template v-for="(bar, i) in geometry.bars" :key="`b${bar.bin.label}`">
          <rect :class="classNames('st-histogramChart__bar', `st-histogramChart__bar--${bar.bin.tone ?? TONES[i % TONES.length]}`, hoveredIndex !== null && hoveredIndex !== i ? 'st-histogramChart__bar--dim' : undefined)" :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" :data-chart-index="i" />
          <text class="st-histogramChart__label" :x="bar.labelX" :y="geometry.height - MARGIN.bottom + 16" text-anchor="middle">{{ bar.bin.label }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="geometry.dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-histogramChart__tooltip" role="presentation" :style="`left: ${(hovered.labelX / geometry.width) * 100}%; top: ${(hovered.y / geometry.height) * 100}%`">
      <span class="st-histogramChart__tooltipLabel">{{ hovered.bin.label }}</span><span class="st-histogramChart__tooltipValue">{{ String(hovered.bin.value) }}</span>
    </div>
  </div>
</template>
