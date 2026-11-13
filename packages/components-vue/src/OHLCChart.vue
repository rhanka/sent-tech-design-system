<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { annotationDataListItems, polygonPoints, resolveAnnotations, type ChartAnnotation } from './chartAnnotations.js';
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from './chartDataLabels.js';
import { resolveActiveIndex } from './chartCrosshair.js';
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from './chartKeyboardNav.js';

export type OHLCChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type OHLCChartProps = {
  data: OHLCChartDatum[];
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

defineOptions({ name: 'OHLCChart', inheritAttrs: false });
const props = withDefaults(defineProps<OHLCChartProps>(), {
  width: 480, height: 240, annotations: undefined, dataLabels: undefined, hoverKey: undefined,
  onHoverKeyChange: undefined, keyboardNav: undefined, onSelectKey: undefined, class: undefined,
});

const hoveredIndex = ref<number | null>(null);
const focusedIndex = ref<number>(-1);
const datapointRefs: Array<SVGRectElement | null> = [];

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);
const label = computed(() => props.label);
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

const validData = computed(() => (props.data ?? []).filter(
  (d) => Number.isFinite(d.open) && Number.isFinite(d.high) && Number.isFinite(d.low) && Number.isFinite(d.close),
));

const ticks = computed(() => {
  const allVals: number[] = [];
  for (const d of validData.value) allVals.push(d.open, d.high, d.low, d.close);
  const rawMin = allVals.length === 0 ? 0 : Math.min(...allVals);
  const rawMax = allVals.length === 0 ? 1 : Math.max(...allVals);
  const safeRawMax = rawMax === rawMin ? rawMin + 1 : rawMax;
  return niceTicks(rawMin, safeRawMax, 5);
});
const domainMin = computed(() => ticks.value[0] ?? 0);
const domainMax = computed(() => ticks.value[ticks.value.length - 1] ?? 1);
const band = computed(() => (validData.value.length > 0 ? plotWidth.value / validData.value.length : plotWidth.value));
const tickW = computed(() => Math.min(band.value * 0.3, 12));

type Bar = {
  datum: OHLCChartDatum;
  index: number;
  bullish: boolean;
  centerX: number;
  barHighY: number;
  barLowY: number;
  openY: number;
  closeY: number;
  openX: number;
  closeX: number;
  tooltipY: number;
};

const bars = computed<Bar[]>(() => validData.value.map((d, i) => {
  const clampedHigh = Math.max(d.high, d.open, d.close);
  const clampedLow = Math.min(d.low, d.open, d.close);
  const bullish = d.close >= d.open;
  const centerX = MARGIN.left + band.value * i + band.value / 2;
  const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin.value, domainMax.value, plotHeight.value, 0);
  const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin.value, domainMax.value, plotHeight.value, 0);
  const openY = MARGIN.top + scaleLinear(d.open, domainMin.value, domainMax.value, plotHeight.value, 0);
  const closeY = MARGIN.top + scaleLinear(d.close, domainMin.value, domainMax.value, plotHeight.value, 0);
  return {
    datum: d, index: i, bullish, centerX,
    barHighY: highY, barLowY: lowY, openY, closeY,
    openX: centerX - tickW.value, closeX: centerX + tickW.value,
    tooltipY: Math.min(highY, openY, closeY),
  };
}));

const resolvedAnnotations = computed(() => resolveAnnotations(props.annotations, {
  xScale: (v) => {
    const bar = bars.value.find((b) => b.datum.label === String(v));
    if (!bar) return null;
    return bar.centerX - MARGIN.left;
  },
  yScale: (v) => (Number.isFinite(v) ? scaleLinear(v, domainMin.value, domainMax.value, plotHeight.value, 0) : null),
  plotLeft: MARGIN.left,
  plotTop: MARGIN.top,
  plotWidth: plotWidth.value,
  plotHeight: plotHeight.value,
}));
const annotationRegions = computed(() => resolvedAnnotations.value.filter((a) => a.kind === 'region'));
const annotationAbove = computed(() => resolvedAnnotations.value.filter((a) => a.kind !== 'region'));

type DataLabelItem = { key: string; x: number; y: number; text: string };
const dataLabelItems = computed<DataLabelItem[]>(() => {
  const dataLabelOpts = normalizeDataLabels(props.dataLabels);
  if (!dataLabelOpts.enabled) return [];
  return bars.value.map((bar) => ({
    key: bar.datum.label,
    x: bar.centerX,
    y: bar.barHighY - 6,
    text: formatDataLabel(bar.datum.close, dataLabelOpts, formatTick),
  }));
});

const dataValueItems = computed(() => [
  ...validData.value.map((d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`),
  ...annotationDataListItems(props.annotations),
]);

const hoverKeys = computed(() => bars.value.map((b) => b.datum.label));
const activeIndex = computed(() => resolveActiveIndex(props.hoverKey, hoveredIndex.value, hoverKeys.value));
const hoveredBar = computed(() => (activeIndex.value >= 0 ? bars.value[activeIndex.value] : undefined));
const navEnabled = computed(() => (props.keyboardNav === true || props.onSelectKey !== undefined) && bars.value.length > 0);

const tickYs = computed(() => ticks.value.map((tick) => ({
  tick,
  ty: MARGIN.top + scaleLinear(tick, domainMin.value, domainMax.value, plotHeight.value, 0),
})));

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
function focusDatum(index: number) {
  focusedIndex.value = index;
  datapointRefs[index]?.focus();
  emitHoverKey(index);
}
function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
  const action = datapointNavAction(event.key, index, bars.value.length);
  if (!action) return;
  event.preventDefault();
  if (action.kind === 'move') {
    focusDatum(action.index);
  } else if (action.kind === 'select') {
    props.onSelectKey?.(bars.value[index].datum.label);
  } else {
    focusedIndex.value = -1;
    emitHoverKey(null);
    props.onSelectKey?.(null);
    (event.currentTarget as SVGElement).blur();
  }
}
function ohlcAriaLabel(d: OHLCChartDatum): string {
  return datapointAriaLabel(d.label, `O ${d.open} H ${d.high} L ${d.low} C ${d.close}`);
}
function setNavRef(el: unknown, index: number) {
  datapointRefs[index] = el as SVGRectElement | null;
}
function onNavFocus(index: number) {
  focusedIndex.value = index;
  emitHoverKey(index);
}
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-ohlcChart', props.class)) }" >
    <div
      class="st-ohlcChart__visual"
      role="img"
      :aria-label="label"
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
        <template v-for="entry in tickYs" :key="`g${entry.tick}`">
          <line class="st-ohlcChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="entry.ty" :y2="entry.ty" />
          <text class="st-ohlcChart__tickLabel" :x="MARGIN.left - 6" :y="entry.ty" text-anchor="end" dominant-baseline="middle">{{ formatTick(entry.tick) }}</text>
        </template>
        <line class="st-ohlcChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-ohlcChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <g v-if="annotationRegions.length > 0" class="st-ohlcChart__annotations st-ohlcChart__annotations--behind">
          <template v-for="a in annotationRegions" :key="`ann-region-${a.key}`">
            <rect v-if="a.kind === 'region'" class="st-ohlcChart__annotationRegion" :x="a.x" :y="a.y" :width="a.width" :height="a.height" />
            <text v-if="a.kind === 'region' && a.label" class="st-ohlcChart__annotationLabel" :x="a.x + 4" :y="a.y + 11">{{ a.label }}</text>
          </template>
        </g>
        <template v-for="(b, i) in bars" :key="`bar${b.index}-${b.datum.label}`">
          <g :class="classNames('st-ohlcChart__bar', `st-ohlcChart__bar--${b.bullish ? 'up' : 'down'}`, hoveredIndex !== null && hoveredIndex !== b.index ? 'st-ohlcChart__bar--dim' : undefined)">
            <line class="st-ohlcChart__range" :x1="b.centerX" :x2="b.centerX" :y1="b.barHighY" :y2="b.barLowY" :data-chart-index="b.index" />
            <line class="st-ohlcChart__open" :x1="b.openX" :x2="b.centerX" :y1="b.openY" :y2="b.openY" :data-chart-index="b.index" />
            <line class="st-ohlcChart__close" :x1="b.centerX" :x2="b.closeX" :y1="b.closeY" :y2="b.closeY" :data-chart-index="b.index" />
          </g>
          <text class="st-ohlcChart__categoryLabel" :x="b.centerX" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ b.datum.label }}</text>
        </template>
        <g v-if="annotationAbove.length > 0" class="st-ohlcChart__annotations st-ohlcChart__annotations--above">
          <template v-for="a in annotationAbove" :key="`ann-${a.key}`">
            <template v-if="a.kind === 'line'">
              <line class="st-ohlcChart__annotationLine" :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" />
              <text v-if="a.label" class="st-ohlcChart__annotationLabel" :x="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4" :y="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4" :text-anchor="a.axis === 'x' ? 'start' : 'end'">{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'shape'">
              <polygon class="st-ohlcChart__annotationShape" :points="polygonPoints(a.points)" />
              <text v-if="a.label" class="st-ohlcChart__annotationLabel" :x="a.labelX" :y="a.labelY" text-anchor="middle">{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'point'">
              <circle class="st-ohlcChart__annotationPoint" :cx="a.x" :cy="a.y" r="4.5" />
              <text v-if="a.label" class="st-ohlcChart__annotationLabel" :x="a.x" :y="a.y - 8" text-anchor="middle">{{ a.label }}</text>
            </template>
            <text v-else class="st-ohlcChart__annotationText" :x="a.x" :y="a.y" :text-anchor="a.anchor">{{ a.text }}</text>
          </template>
        </g>
        <g v-if="dataLabelItems.length > 0" class="st-ohlcChart__dataLabels" aria-hidden="true">
          <text v-for="d in dataLabelItems" :key="`dl-${d.key}`" class="st-ohlcChart__dataLabel" :x="d.x" :y="d.y" text-anchor="middle" dominant-baseline="auto">{{ d.text }}</text>
        </g>
        <g v-if="hoveredBar" class="st-ohlcChart__crosshair" aria-hidden="true">
          <line class="st-ohlcChart__crosshairLine" :x1="hoveredBar.centerX" :x2="hoveredBar.centerX" :y1="MARGIN.top" :y2="MARGIN.top + plotHeight" />
        </g>
      </svg>
      <svg
        v-if="navEnabled"
        class="st-ohlcChart__navLayer"
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        role="group"
        :aria-label="`${label} — points de données`"
      >
        <rect
          v-for="(bar, i) in bars"
          :key="`nav${i}-${bar.datum.label}`"
          :ref="(el) => setNavRef(el, i)"
          class="st-ohlcChart__navDatum"
          :x="bar.centerX - band / 2"
          :y="MARGIN.top"
          :width="band"
          :height="plotHeight"
          role="img"
          :tabindex="rovingTabIndex(i, focusedIndex, bars.length)"
          :aria-label="ohlcAriaLabel(bar.datum)"
          @keydown="handleDatapointKeyDown($event, i)"
          @focus="onNavFocus(i)"
        />
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredBar"
      class="st-ohlcChart__tooltip"
      role="presentation"
      :style="`left:${(hoveredBar.centerX / width) * 100}%;top:${(hoveredBar.tooltipY / height) * 100}%`"
    >
      <span class="st-ohlcChart__tooltipLabel">{{ hoveredBar.datum.label }}</span>
      <span class="st-ohlcChart__tooltipValue">{{ `O ${hoveredBar.datum.open} H ${hoveredBar.datum.high} L ${hoveredBar.datum.low} C ${hoveredBar.datum.close}` }}</span>
    </div>
  </div>
</template>
