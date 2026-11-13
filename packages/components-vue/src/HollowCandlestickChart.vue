<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type HollowCandlestickChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type HollowCandlestickChartProps = {
  data: HollowCandlestickChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

defineOptions({ name: 'HollowCandlestickChart', inheritAttrs: false });
const props = withDefaults(defineProps<HollowCandlestickChartProps>(), {
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
  // Filter invalid candles BEFORE domain
  const validData = data.filter(
    (d) =>
      Number.isFinite(d.open) &&
      Number.isFinite(d.high) &&
      Number.isFinite(d.low) &&
      Number.isFinite(d.close),
  );
  const allVals: number[] = [];
  for (const d of validData) {
    // Domain includes open/high/low/close (not just high/low)
    allVals.push(d.open, d.high, d.low, d.close);
  }
  const rawMin = allVals.length === 0 ? 0 : Math.min(...allVals);
  const rawMax = allVals.length === 0 ? 1 : Math.max(...allVals);
  // Flat domain → fallback range 1 to avoid division by zero
  const safeRawMax = rawMax === rawMin ? rawMin + 1 : rawMax;
  const ticks = niceTicks(rawMin, safeRawMax, 5);
  const domainMin = ticks[0] ?? rawMin;
  const domainMax = ticks[ticks.length - 1] ?? safeRawMax;
  const band = validData.length > 0 ? plotWidth / validData.length : plotWidth;
  const bodyW = band * 0.55;
  type Candle = {
    datum: HollowCandlestickChartDatum;
    index: number;
    up: boolean;
    hollow: boolean;
    centerX: number;
    bodyX: number;
    bodyY: number;
    bodyW: number;
    bodyH: number;
    wickHighY: number;
    wickLowY: number;
    tooltipY: number;
  };
  const candles: Candle[] = validData.map((d, i) => {
    // clamp high/low to guarantee high≥max(O,C) and low≤min(O,C)
    const clampedHigh = Math.max(d.high, d.open, d.close);
    const clampedLow = Math.min(d.low, d.open, d.close);
    // Colour: close vs PREVIOUS close (first candle: close ≥ open)
    const prevClose = i > 0 ? validData[i - 1].close : d.open;
    const up = d.close >= prevClose;
    // Fill: hollow if bullish (close ≥ open), filled otherwise
    const hollow = d.close >= d.open;
    const centerX = MARGIN.left + band * i + band / 2;
    const bodyTop = MARGIN.top + scaleLinear(Math.max(d.open, d.close), domainMin, domainMax, plotHeight, 0);
    const bodyBot = MARGIN.top + scaleLinear(Math.min(d.open, d.close), domainMin, domainMax, plotHeight, 0);
    const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin, domainMax, plotHeight, 0);
    const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin, domainMax, plotHeight, 0);
    return {
      datum: d, index: i, up, hollow, centerX,
      bodyX: centerX - bodyW / 2,
      bodyY: bodyTop,
      bodyW,
      bodyH: Math.max(bodyBot - bodyTop, 0.5),
      wickHighY: highY,
      wickLowY: lowY,
      tooltipY: bodyTop,
    };
  });
  const dataValueItems = validData.map(
    (d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`,
  );
  return { width, height, ticks, domainMin, domainMax, candles, dataValueItems };
});

const hoveredIndex = ref<number | null>(null);
const hoveredCandle = computed(() =>
  hoveredIndex.value !== null ? geometry.value.candles[hoveredIndex.value] : undefined,
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
  <div v-bind="{ ...($attrs), class: (classNames('st-hollowCandlestickChart', props.class)) }" >
    <div class="st-hollowCandlestickChart__visual" role="img" :aria-label="props.label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${geometry.width} ${geometry.height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="tick in geometry.ticks" :key="`g${tick}`">
          <line class="st-hollowCandlestickChart__grid" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="tickY(tick)" :y2="tickY(tick)" />
          <text class="st-hollowCandlestickChart__tickLabel" :x="MARGIN.left - 6" :y="tickY(tick)" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick) }}</text>
        </template>
        <line class="st-hollowCandlestickChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="geometry.height - MARGIN.bottom" />
        <line class="st-hollowCandlestickChart__axis" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="geometry.height - MARGIN.bottom" :y2="geometry.height - MARGIN.bottom" />
        <template v-for="c in geometry.candles" :key="`k${c.index}`">
          <line :class="classNames('st-hollowCandlestickChart__wick', `st-hollowCandlestickChart__wick--${c.up ? 'up' : 'down'}`)" :x1="c.centerX" :x2="c.centerX" :y1="c.wickHighY" :y2="c.wickLowY" :data-chart-index="c.index" />
          <rect :class="classNames('st-hollowCandlestickChart__candle', `st-hollowCandlestickChart__candle--${c.up ? 'up' : 'down'}`, `st-hollowCandlestickChart__candle--${c.hollow ? 'hollow' : 'filled'}`, hoveredIndex !== null && hoveredIndex !== c.index ? 'st-hollowCandlestickChart__candle--dim' : undefined)" :x="c.bodyX" :y="c.bodyY" :width="c.bodyW" :height="c.bodyH" rx="1" :data-chart-index="c.index" />
          <text class="st-hollowCandlestickChart__categoryLabel" :x="c.centerX" :y="geometry.height - MARGIN.bottom + 16" text-anchor="middle">{{ c.datum.label }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="geometry.dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredCandle" class="st-hollowCandlestickChart__tooltip" role="presentation" :style="`left:${(hoveredCandle.centerX / geometry.width) * 100}%;top:${(hoveredCandle.tooltipY / geometry.height) * 100}%`">
      <span class="st-hollowCandlestickChart__tooltipLabel">{{ hoveredCandle.datum.label }}</span><span class="st-hollowCandlestickChart__tooltipValue">{{ `O ${hoveredCandle.datum.open} H ${hoveredCandle.datum.high} L ${hoveredCandle.datum.low} C ${hoveredCandle.datum.close}` }}</span>
    </div>
  </div>
</template>
