<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type HLCChartDatum = {
  label: string;
  high: number;
  low: number;
  close: number;
};

export type HLCChartProps = {
  data: HLCChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

defineOptions({ name: 'HLCChart', inheritAttrs: false });
const props = withDefaults(defineProps<HLCChartProps>(), {
  data: () => [], width: 480, height: 240, class: undefined,
});

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1 * pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

const geometry = computed(() => {
  const data = props.data ?? [];
  const width = props.width ?? 480;
  const height = props.height ?? 240;
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  // Filter invalid bars BEFORE domain
  const validData = data.filter(
    (d) =>
      Number.isFinite(d.high) &&
      Number.isFinite(d.low) &&
      Number.isFinite(d.close),
  );
  const allVals: number[] = [];
  for (const d of validData) {
    // Domain includes high/low/close (no open)
    allVals.push(d.high, d.low, d.close);
  }
  const rawMin = allVals.length === 0 ? 0 : Math.min(...allVals);
  const rawMax = allVals.length === 0 ? 1 : Math.max(...allVals);
  // Flat domain → fallback range 1 to avoid division by zero
  const safeRawMax = rawMax === rawMin ? rawMin + 1 : rawMax;
  const ticks = niceTicks(rawMin, safeRawMax, 5);
  const domainMin = ticks[0] ?? rawMin;
  const domainMax = ticks[ticks.length - 1] ?? safeRawMax;
  const band = validData.length > 0 ? plotWidth / validData.length : plotWidth;
  // length of the close tick (right of the bar)
  const tickW = Math.min(band * 0.3, 12);
  type Bar = {
    datum: HLCChartDatum;
    index: number;
    bullish: boolean;
    centerX: number;
    barHighY: number;
    barLowY: number;
    closeY: number;
    closeX: number;
    tooltipY: number;
  };
  const bars: Bar[] = validData.map((d, i) => {
    // clamp high/low to guarantee high≥close and low≤close
    const clampedHigh = Math.max(d.high, d.close);
    const clampedLow = Math.min(d.low, d.close);
    // up/down = close vs. previous close (first bar = up)
    const prevClose = i > 0 ? validData[i - 1].close : d.close;
    const bullish = d.close >= prevClose;
    const centerX = MARGIN.left + band * i + band / 2;
    const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin, domainMax, plotHeight, 0);
    const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin, domainMax, plotHeight, 0);
    const closeY = MARGIN.top + scaleLinear(d.close, domainMin, domainMax, plotHeight, 0);
    return {
      datum: d, index: i, bullish, centerX,
      barHighY: highY, barLowY: lowY,
      closeY,
      closeX: centerX + tickW,
      tooltipY: Math.min(highY, closeY),
    };
  });
  const dataValueItems = validData.map(
    (d) => `${d.label}: H ${d.high} L ${d.low} C ${d.close}`,
  );
  return { width, height, ticks, domainMin, domainMax, bars, dataValueItems };
});

const hoveredIndex = ref<number | null>(null);
const hoveredBar = computed(() =>
  hoveredIndex.value !== null ? geometry.value.bars[hoveredIndex.value] : undefined,
);

function handleLeave() {
  hoveredIndex.value = null;
}

function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) { hoveredIndex.value = null; return; }
  const idx = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(idx) ? idx : null;
}

function tickY(tick: number): number {
  const { domainMin, domainMax, height } = geometry.value;
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  return MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0);
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-hlcChart', props.class)">
    <div class="st-hlcChart__visual" role="img" :aria-label="props.label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${geometry.width} ${geometry.height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="tick in geometry.ticks" :key="`g${tick}`">
          <line class="st-hlcChart__grid" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="tickY(tick)" :y2="tickY(tick)" />
          <text class="st-hlcChart__tickLabel" :x="MARGIN.left - 6" :y="tickY(tick)" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick) }}</text>
        </template>
        <line class="st-hlcChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="geometry.height - MARGIN.bottom" />
        <line class="st-hlcChart__axis" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="geometry.height - MARGIN.bottom" :y2="geometry.height - MARGIN.bottom" />
        <template v-for="b in geometry.bars" :key="`k${b.index}`">
          <g :class="classNames('st-hlcChart__bar', `st-hlcChart__bar--${b.bullish ? 'up' : 'down'}`, hoveredIndex !== null && hoveredIndex !== b.index ? 'st-hlcChart__bar--dim' : undefined)">
            <line class="st-hlcChart__range" :x1="b.centerX" :x2="b.centerX" :y1="b.barHighY" :y2="b.barLowY" :data-chart-index="b.index" />
            <line class="st-hlcChart__close" :x1="b.centerX" :x2="b.closeX" :y1="b.closeY" :y2="b.closeY" :data-chart-index="b.index" />
          </g>
          <text class="st-hlcChart__categoryLabel" :x="b.centerX" :y="geometry.height - MARGIN.bottom + 16" text-anchor="middle">{{ b.datum.label }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="geometry.dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredBar" class="st-hlcChart__tooltip" role="presentation" :style="`left:${(hoveredBar.centerX / geometry.width) * 100}%;top:${(hoveredBar.tooltipY / geometry.height) * 100}%`">
      <span class="st-hlcChart__tooltipLabel">{{ hoveredBar.datum.label }}</span><span class="st-hlcChart__tooltipValue">{{ `H ${hoveredBar.datum.high} L ${hoveredBar.datum.low} C ${hoveredBar.datum.close}` }}</span>
    </div>
  </div>
</template>
