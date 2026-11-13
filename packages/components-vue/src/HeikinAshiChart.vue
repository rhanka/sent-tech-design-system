<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type HeikinAshiChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type HeikinAshiChartProps = {
  data: HeikinAshiChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

type HACandle = {
  label: string;
  haOpen: number;
  haHigh: number;
  haLow: number;
  haClose: number;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

defineOptions({ name: 'HeikinAshiChart', inheritAttrs: false });
const props = withDefaults(defineProps<HeikinAshiChartProps>(), {
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

function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

// Heikin-Ashi : récurrence sur haOpen
function computeHeikinAshi(rows: HeikinAshiChartDatum[]): HACandle[] {
  const out: HACandle[] = [];
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i];
    const haClose = (d.open + d.high + d.low + d.close) / 4;
    const haOpen =
      i === 0 ? (d.open + d.close) / 2 : (out[i - 1].haOpen + out[i - 1].haClose) / 2;
    const haHigh = Math.max(d.high, haOpen, haClose);
    const haLow = Math.min(d.low, haOpen, haClose);
    out.push({ label: d.label, haOpen, haHigh, haLow, haClose });
  }
  return out;
}

const geometry = computed(() => {
  const data = props.data ?? [];
  const width = props.width ?? 480;
  const height = props.height ?? 240;
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  // filter invalid candles BEFORE HA computation and domain
  const validData = data.filter(
    (d) =>
      Number.isFinite(d.open) &&
      Number.isFinite(d.high) &&
      Number.isFinite(d.low) &&
      Number.isFinite(d.close),
  );
  const haData = computeHeikinAshi(validData);
  const allVals: number[] = [];
  for (const d of haData) {
    // Domain over HA values (haOpen/haHigh/haLow/haClose)
    allVals.push(d.haOpen, d.haHigh, d.haLow, d.haClose);
  }
  const rawMin = allVals.length === 0 ? 0 : Math.min(...allVals);
  const rawMax = allVals.length === 0 ? 1 : Math.max(...allVals);
  // Flat domain → fallback range 1 to avoid division by zero
  const safeRawMax = rawMax === rawMin ? rawMin + 1 : rawMax;
  const ticks = niceTicks(rawMin, safeRawMax, 5);
  const domainMin = ticks[0] ?? rawMin;
  const domainMax = ticks[ticks.length - 1] ?? safeRawMax;
  const band = haData.length > 0 ? plotWidth / haData.length : plotWidth;
  const bodyW = band * 0.55;
  type Candle = {
    datum: HACandle;
    index: number;
    bullish: boolean;
    centerX: number;
    bodyX: number;
    bodyY: number;
    bodyW: number;
    bodyH: number;
    wickHighY: number;
    wickLowY: number;
    tooltipY: number;
  };
  const candles: Candle[] = haData.map((d, i) => {
    const bullish = d.haClose >= d.haOpen;
    const centerX = MARGIN.left + band * i + band / 2;
    const bodyTop = MARGIN.top + scaleLinear(Math.max(d.haOpen, d.haClose), domainMin, domainMax, plotHeight, 0);
    const bodyBot = MARGIN.top + scaleLinear(Math.min(d.haOpen, d.haClose), domainMin, domainMax, plotHeight, 0);
    const highY = MARGIN.top + scaleLinear(d.haHigh, domainMin, domainMax, plotHeight, 0);
    const lowY = MARGIN.top + scaleLinear(d.haLow, domainMin, domainMax, plotHeight, 0);
    return {
      datum: d, index: i, bullish, centerX,
      bodyX: centerX - bodyW / 2,
      bodyY: bodyTop,
      bodyW,
      bodyH: Math.max(bodyBot - bodyTop, 0.5),
      wickHighY: highY, wickLowY: lowY,
      tooltipY: bodyTop,
    };
  });
  const dataValueItems = haData.map(
    (d) => `${d.label}: O ${fmt(d.haOpen)} H ${fmt(d.haHigh)} L ${fmt(d.haLow)} C ${fmt(d.haClose)}`,
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
  return MARGIN.top + scaleLinear(tick, geometry.value.domainMin, geometry.value.domainMax, Math.max(geometry.value.height - MARGIN.top - MARGIN.bottom, 1), 0);
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-heikinAshiChart', props.class)">
    <div class="st-heikinAshiChart__visual" role="img" :aria-label="props.label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${geometry.width} ${geometry.height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="tick in geometry.ticks" :key="`g${tick}`">
          <line class="st-heikinAshiChart__grid" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="tickY(tick)" :y2="tickY(tick)" />
          <text class="st-heikinAshiChart__tickLabel" :x="MARGIN.left - 6" :y="tickY(tick)" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick) }}</text>
        </template>
        <line class="st-heikinAshiChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="geometry.height - MARGIN.bottom" />
        <line class="st-heikinAshiChart__axis" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="geometry.height - MARGIN.bottom" :y2="geometry.height - MARGIN.bottom" />
        <template v-for="c in geometry.candles" :key="`c${c.index}`">
          <line :class="`st-heikinAshiChart__wick st-heikinAshiChart__wick--${c.bullish ? 'up' : 'down'}`" :x1="c.centerX" :x2="c.centerX" :y1="c.wickHighY" :y2="c.wickLowY" :data-chart-index="c.index" />
          <rect :class="classNames('st-heikinAshiChart__body', `st-heikinAshiChart__body--${c.bullish ? 'up' : 'down'}`, hoveredIndex !== null && hoveredIndex !== c.index ? 'st-heikinAshiChart__body--dim' : undefined)" :x="c.bodyX" :y="c.bodyY" :width="c.bodyW" :height="c.bodyH" rx="1" :data-chart-index="c.index" />
          <text class="st-heikinAshiChart__categoryLabel" :x="c.centerX" :y="geometry.height - MARGIN.bottom + 16" text-anchor="middle">{{ c.datum.label }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="geometry.dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredCandle" class="st-heikinAshiChart__tooltip" role="presentation" :style="`left:${(hoveredCandle.centerX / geometry.width) * 100}%;top:${(hoveredCandle.tooltipY / geometry.height) * 100}%`">
      <span class="st-heikinAshiChart__tooltipLabel">{{ hoveredCandle.datum.label }}</span><span class="st-heikinAshiChart__tooltipValue">{{ `O ${fmt(hoveredCandle.datum.haOpen)} H ${fmt(hoveredCandle.datum.haHigh)} L ${fmt(hoveredCandle.datum.haLow)} C ${fmt(hoveredCandle.datum.haClose)}` }}</span>
    </div>
  </div>
</template>
