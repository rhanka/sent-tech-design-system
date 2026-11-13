<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from './chartAnnotations.js';
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from './chartDataLabels.js';
import { resolveActiveIndex } from './chartCrosshair.js';
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from './chartKeyboardNav.js';

export type CandlestickChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type CandlestickChartProps = {
  data: CandlestickChartDatum[];
  label: string;
  width?: number;
  height?: number;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  keyboardNav?: boolean;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

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

defineOptions({ name: 'CandlestickChart', inheritAttrs: false });
const props = withDefaults(defineProps<CandlestickChartProps>(), {
  data: () => [],
  width: 480,
  height: 240,
  annotations: undefined,
  dataLabels: undefined,
  hoverKey: undefined,
  onHoverKeyChange: undefined,
  keyboardNav: undefined,
  onSelectKey: undefined,
  class: undefined,
});

const hoveredIndex = ref<number | null>(null);
// FR-5 — roving keyboard focus over the data points (separate from hover).
const focusedIndex = ref<number>(-1);
const datapointRefs = ref<Array<SVGRectElement | null>>([]);
function setDatapointRef(el: unknown, index: number) {
  datapointRefs.value[index] = el as SVGRectElement | null;
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);

const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

// Filter invalid candles BEFORE domain
const validData = computed(() =>
  (props.data ?? []).filter(
    (d) =>
      Number.isFinite(d.open) &&
      Number.isFinite(d.high) &&
      Number.isFinite(d.low) &&
      Number.isFinite(d.close),
  ),
);

const ticks = computed(() => {
  const allVals: number[] = [];
  for (const d of validData.value) {
    // Domain includes open/high/low/close (not just high/low)
    allVals.push(d.open, d.high, d.low, d.close);
  }
  const rawMin = allVals.length === 0 ? 0 : Math.min(...allVals);
  const rawMax = allVals.length === 0 ? 1 : Math.max(...allVals);
  // Flat domain → fallback range 1 to avoid division by zero
  const safeRawMax = rawMax === rawMin ? rawMin + 1 : rawMax;
  return niceTicks(rawMin, safeRawMax, 5);
});
const domainMin = computed(() => (ticks.value[0] ?? 0));
const domainMax = computed(() => (ticks.value[ticks.value.length - 1] ?? 0));

const band = computed(() => (validData.value.length > 0 ? plotWidth.value / validData.value.length : plotWidth.value));
const bodyW = computed(() => band.value * 0.55);

type Candle = {
  datum: CandlestickChartDatum;
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

const candles = computed<Candle[]>(() =>
  validData.value.map((d, i) => {
    // Clamp high/low to guarantee high≥max(O,C) and low≤min(O,C)
    const clampedHigh = Math.max(d.high, d.open, d.close);
    const clampedLow = Math.min(d.low, d.open, d.close);
    const bullish = d.close >= d.open;
    const centerX = MARGIN.left + band.value * i + band.value / 2;

    const bodyTop = MARGIN.top + scaleLinear(Math.max(d.open, d.close), domainMin.value, domainMax.value, plotHeight.value, 0);
    const bodyBot = MARGIN.top + scaleLinear(Math.min(d.open, d.close), domainMin.value, domainMax.value, plotHeight.value, 0);
    const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin.value, domainMax.value, plotHeight.value, 0);
    const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin.value, domainMax.value, plotHeight.value, 0);

    return {
      datum: d,
      index: i,
      bullish,
      centerX,
      bodyX: centerX - bodyW.value / 2,
      bodyY: bodyTop,
      bodyW: bodyW.value,
      bodyH: Math.max(bodyBot - bodyTop, 0.5),
      wickHighY: highY,
      wickLowY: lowY,
      tooltipY: bodyTop,
    };
  }),
);

// --- Annotation overlay -------------------------------------------------
// The x coordinate is CATEGORICAL (a candle `label` → centre of band); the
// y coordinate is a price-axis number. Regions render behind the candles,
// every other kind above.
const resolvedAnnotations = computed(() => {
  const priceY = (v: number): number | null => {
    if (!Number.isFinite(v)) return null;
    return scaleLinear(v, domainMin.value, domainMax.value, plotHeight.value, 0);
  };
  const categoryPixel = (v: number | string): number | null => {
    const candle = candles.value.find((c) => c.datum.label === String(v));
    if (!candle) return null;
    return candle.centerX - MARGIN.left;
  };
  return resolveAnnotations(props.annotations, {
    xScale: (v) => categoryPixel(v),
    yScale: (v) => priceY(v),
    plotLeft: MARGIN.left,
    plotTop: MARGIN.top,
    plotWidth: plotWidth.value,
    plotHeight: plotHeight.value,
  });
});
const annotationRegions = computed(() => resolvedAnnotations.value.filter((a) => a.kind === 'region'));
const annotationAbove = computed(() => resolvedAnnotations.value.filter((a) => a.kind !== 'region'));

// --- Data labels ------------------------------------------------------
// One `close` value label per candle, placed just above it. aria-hidden.
const dataLabelOpts = computed(() => normalizeDataLabels(props.dataLabels));
type DataLabelItem = { key: string; x: number; y: number; text: string };
const dataLabelItems = computed<DataLabelItem[]>(() =>
  dataLabelOpts.value.enabled
    ? candles.value.map((candle) => ({
        key: candle.datum.label,
        x: candle.centerX,
        y: candle.wickHighY - 6,
        text: formatDataLabel(candle.datum.close, dataLabelOpts.value, formatTick),
      }))
    : [],
);

const dataValueItems = computed(() => [
  ...validData.value.map((d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`),
  ...annotationDataListItems(props.annotations),
]);

// Stable key per candle (FR-3): its `label`. Resolves a controlled
// `hoverKey` to an index and feeds `onHoverKeyChange` from pointer events.
const hoverKeys = computed(() => candles.value.map((c) => c.datum.label));
function emitHoverKey(index: number | null) {
  props.onHoverKeyChange?.(index == null ? null : hoverKeys.value[index] ?? null);
}
function handleLeave() {
  hoveredIndex.value = null;
  emitHoverKey(null);
}
function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    emitHoverKey(null);
    return;
  }
  const raw = Number(target.getAttribute('data-chart-index'));
  const index = Number.isInteger(raw) ? raw : null;
  hoveredIndex.value = index;
  emitHoverKey(index);
}

// Index whose crosshair/tooltip is DISPLAYED: the controlled `hoverKey`
// when provided (resolved against `hoverKeys`), else the pointer index.
const activeIndex = computed(() => resolveActiveIndex(props.hoverKey, hoveredIndex.value, hoverKeys.value));
const hoveredCandle = computed(() => (activeIndex.value >= 0 ? candles.value[activeIndex.value] : undefined));

// --- Keyboard navigation (FR-5) --------------------------------------
const navEnabled = computed(() => (props.keyboardNav === true || props.onSelectKey !== undefined) && candles.value.length > 0);
function focusDatum(index: number) {
  focusedIndex.value = index;
  datapointRefs.value[index]?.focus();
  emitHoverKey(index);
}
function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
  const action = datapointNavAction(event.key, index, candles.value.length);
  if (!action) return;
  event.preventDefault();
  if (action.kind === 'move') {
    focusDatum(action.index);
  } else if (action.kind === 'select') {
    props.onSelectKey?.(candles.value[index].datum.label);
  } else {
    focusedIndex.value = -1;
    emitHoverKey(null);
    props.onSelectKey?.(null);
    (event.currentTarget as SVGElement).blur();
  }
}
function ohlcAriaLabel(d: CandlestickChartDatum): string {
  return datapointAriaLabel(d.label, `O ${d.open} H ${d.high} L ${d.low} C ${d.close}`);
}
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-candlestickChart', props.class)) }" >
    <div
      class="st-candlestickChart__visual"
      role="img"
      :aria-label="props.label"
      @pointermove="handlePointerMove"
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
        <template v-for="tick in ticks" :key="`g${tick}`">
          <line class="st-candlestickChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0)" :y2="MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0)" />
          <text class="st-candlestickChart__tickLabel" :x="MARGIN.left - 6" :y="MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0)" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick) }}</text>
        </template>
        <line class="st-candlestickChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-candlestickChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <g v-if="annotationRegions.length > 0" class="st-candlestickChart__annotations st-candlestickChart__annotations--behind">
          <template v-for="a in annotationRegions" :key="`ann-region-${a.key}`">
            <rect class="st-candlestickChart__annotationRegion" :x="a.x" :y="a.y" :width="a.width" :height="a.height" />
            <text v-if="a.label" class="st-candlestickChart__annotationLabel" :x="a.x + 4" :y="a.y + 11">{{ a.label }}</text>
          </template>
        </g>
        <template v-for="c in candles" :key="c.index">
          <line :class="`st-candlestickChart__wick st-candlestickChart__wick--${c.bullish ? 'up' : 'down'}`" :x1="c.centerX" :x2="c.centerX" :y1="c.wickHighY" :y2="c.wickLowY" :data-chart-index="c.index" />
          <rect
            :class="classNames(
              'st-candlestickChart__body',
              `st-candlestickChart__body--${c.bullish ? 'up' : 'down'}`,
              hoveredIndex !== null && hoveredIndex !== c.index ? 'st-candlestickChart__body--dim' : undefined,
            )"
            :x="c.bodyX" :y="c.bodyY" :width="c.bodyW" :height="c.bodyH"
            rx="1"
            :data-chart-index="c.index"
          />
          <text class="st-candlestickChart__categoryLabel" :x="c.centerX" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ c.datum.label }}</text>
        </template>
        <g v-if="annotationAbove.length > 0" class="st-candlestickChart__annotations st-candlestickChart__annotations--above">
          <template v-for="a in annotationAbove" :key="a.key">
            <template v-if="a.kind === 'line'">
              <line class="st-candlestickChart__annotationLine" :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" />
              <text
                v-if="a.label"
                class="st-candlestickChart__annotationLabel"
                :x="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4"
                :y="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                :text-anchor="a.axis === 'x' ? 'start' : 'end'"
              >{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'shape'">
              <polygon class="st-candlestickChart__annotationShape" :points="polygonPoints(a.points)" />
              <text v-if="a.label" class="st-candlestickChart__annotationLabel" :x="a.labelX" :y="a.labelY" text-anchor="middle">{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'point'">
              <circle class="st-candlestickChart__annotationPoint" :cx="a.x" :cy="a.y" r="4.5" />
              <text v-if="a.label" class="st-candlestickChart__annotationLabel" :x="a.x" :y="a.y - 8" text-anchor="middle">{{ a.label }}</text>
            </template>
            <text v-else class="st-candlestickChart__annotationText" :x="a.x" :y="a.y" :text-anchor="a.anchor">{{ a.text }}</text>
          </template>
        </g>
        <g v-if="dataLabelItems.length > 0" class="st-candlestickChart__dataLabels" aria-hidden="true">
          <text
            v-for="d in dataLabelItems"
            :key="`dl-${d.key}`"
            class="st-candlestickChart__dataLabel"
            :x="d.x" :y="d.y" text-anchor="middle" dominant-baseline="auto"
          >{{ d.text }}</text>
        </g>
        <g v-if="hoveredCandle" class="st-candlestickChart__crosshair" aria-hidden="true">
          <line class="st-candlestickChart__crosshairLine" :x1="hoveredCandle.centerX" :x2="hoveredCandle.centerX" :y1="MARGIN.top" :y2="MARGIN.top + plotHeight" />
        </g>
      </svg>
      <svg
        v-if="navEnabled"
        class="st-candlestickChart__navLayer"
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        role="group"
        :aria-label="`${props.label} — points de données`"
      >
        <rect
          v-for="(candle, i) in candles"
          :key="`nav${i}-${candle.datum.label}`"
          :ref="(el: unknown) => setDatapointRef(el, i)"
          class="st-candlestickChart__navDatum"
          :x="candle.centerX - band / 2"
          :y="MARGIN.top"
          :width="band"
          :height="plotHeight"
          role="img"
          :tabindex="rovingTabIndex(i, focusedIndex, candles.length)"
          :aria-label="ohlcAriaLabel(candle.datum)"
          @keydown="handleDatapointKeyDown($event, i)"
          @focus="focusedIndex = i; emitHoverKey(i)"
        />
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredCandle"
      class="st-candlestickChart__tooltip"
      role="presentation"
      :style="`left:${(hoveredCandle.centerX / width) * 100}%;top:${(hoveredCandle.tooltipY / height) * 100}%`"
    >
      <span class="st-candlestickChart__tooltipLabel">{{ hoveredCandle.datum.label }}</span>
      <span class="st-candlestickChart__tooltipValue">{{ `O ${hoveredCandle.datum.open} H ${hoveredCandle.datum.high} L ${hoveredCandle.datum.low} C ${hoveredCandle.datum.close}` }}</span>
    </div>
  </div>
</template>
