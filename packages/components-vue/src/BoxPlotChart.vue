<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type BoxPlotChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type BoxPlotChartDatum = {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  tone?: BoxPlotChartTone;
};

export type BoxPlotChartProps = {
  data: BoxPlotChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 16, right: 20, bottom: 38, left: 48 } as const;
const TONES: BoxPlotChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, '');
}

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

defineOptions({ name: 'BoxPlotChart', inheritAttrs: false });
const props = withDefaults(defineProps<BoxPlotChartProps>(), {
  width: 480,
  height: 260,
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
const height = computed(() => props.height ?? 260);

const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

const allValues = computed(() =>
  (props.data ?? [])
    .flatMap((d) => [d.min, d.q1, d.median, d.q3, d.max, ...(d.outliers ?? [])])
    .filter(Number.isFinite),
);

const domainMin = computed(() => {
  if (allValues.value.length === 0) return 0;
  const min = Math.min(...allValues.value);
  const max = Math.max(...allValues.value);
  const pad = (max - min) * 0.08 || Math.max(Math.abs(max), 1) * 0.1;
  return min - pad;
});
const domainMax = computed(() => {
  if (allValues.value.length === 0) return 1;
  const min = Math.min(...allValues.value);
  const max = Math.max(...allValues.value);
  const pad = (max - min) * 0.08 || Math.max(Math.abs(max), 1) * 0.1;
  return max + pad;
});

const plots = computed(() => {
  const data = props.data ?? [];
  const band = data.length > 0 ? plotWidth.value / data.length : plotWidth.value;
  const boxWidth = Math.min(54, Math.max(18, band * 0.44));
  return data.map((datum, index) => {
    const cx = MARGIN.left + band * (index + 0.5);
    const y = (value: number) => MARGIN.top + scaleLinear(value, domainMin.value, domainMax.value, plotHeight.value, 0);
    const q1Y = y(datum.q1);
    const q3Y = y(datum.q3);
    const minY = y(datum.min);
    const maxY = y(datum.max);
    return {
      datum,
      tone: datum.tone ?? TONES[index % TONES.length],
      cx,
      boxX: cx - boxWidth / 2,
      boxY: Math.min(q1Y, q3Y),
      boxWidth,
      boxHeight: Math.max(Math.abs(q1Y - q3Y), 1),
      medianY: y(datum.median),
      minY,
      maxY,
      capWidth: boxWidth * 0.72,
      outliers: (datum.outliers ?? []).filter(Number.isFinite).map((v) => ({ value: v, y: y(v) })),
    };
  });
});

const dataValueItems = computed(() =>
  (props.data ?? []).map((datum) => {
    const summary = `${datum.label}: min ${formatNumber(datum.min)}, q1 ${formatNumber(datum.q1)}, median ${formatNumber(datum.median)}, q3 ${formatNumber(datum.q3)}, max ${formatNumber(datum.max)}`;
    const outliers = datum.outliers?.length ? `, outliers ${datum.outliers.map(formatNumber).join(', ')}` : '';
    return `${summary}${outliers}`;
  }),
);

const hovered = computed(() => (hoveredIndex.value !== null ? plots.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-boxPlotChart', props.class)) }" >
    <div
      class="st-boxPlotChart__visual"
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
        <line class="st-boxPlotChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-boxPlotChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <template v-for="(plot, i) in plots" :key="plot.datum.label">
          <line class="st-boxPlotChart__whisker" :x1="plot.cx" :x2="plot.cx" :y1="plot.minY" :y2="plot.maxY" :data-chart-index="i" />
          <line class="st-boxPlotChart__whiskerCap" :x1="plot.cx - plot.capWidth / 2" :x2="plot.cx + plot.capWidth / 2" :y1="plot.minY" :y2="plot.minY" :data-chart-index="i" />
          <line class="st-boxPlotChart__whiskerCap" :x1="plot.cx - plot.capWidth / 2" :x2="plot.cx + plot.capWidth / 2" :y1="plot.maxY" :y2="plot.maxY" :data-chart-index="i" />
          <rect
            :class="classNames(
              'st-boxPlotChart__box',
              `st-boxPlotChart__box--${plot.tone}`,
              hoveredIndex !== null && hoveredIndex !== i ? 'st-boxPlotChart__box--dim' : undefined,
            )"
            :x="plot.boxX"
            :y="plot.boxY"
            :width="plot.boxWidth"
            :height="plot.boxHeight"
            :data-chart-index="i"
          />
          <line class="st-boxPlotChart__median" :x1="plot.boxX" :x2="plot.boxX + plot.boxWidth" :y1="plot.medianY" :y2="plot.medianY" :data-chart-index="i" />
          <text class="st-boxPlotChart__label" :x="plot.cx" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ plot.datum.label }}</text>
          <circle v-for="(outlier, oi) in plot.outliers" :key="`o${plot.datum.label}-${oi}`" class="st-boxPlotChart__outlier" :cx="plot.cx" :cy="outlier.y" r="3" :data-chart-index="i" />
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-boxPlotChart__tooltip"
      role="presentation"
      :style="`left: ${(hovered.cx / width) * 100}%; top: ${(hovered.medianY / height) * 100}%`"
    >
      <span class="st-boxPlotChart__tooltipLabel">{{ hovered.datum.label }}</span>
      <span class="st-boxPlotChart__tooltipValue">{{ `Median ${formatNumber(hovered.datum.median)}` }}</span>
    </div>
  </div>
</template>
