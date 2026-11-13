<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type StateTimelineTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type StateTimelineSegment = {
  start: number;
  end: number;
  state: string | number;
  tone?: StateTimelineTone;
};

export type StateTimelineSeries = {
  series: string;
  segments: StateTimelineSegment[];
};

export type StateTimelineChartProps = {
  data: StateTimelineSeries[];
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

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

// Truncate a label to the left margin width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return '…';
  return `${text.slice(0, maxChars - 1)}…`;
}

defineOptions({ name: 'StateTimelineChart', inheritAttrs: false });
const props = withDefaults(defineProps<StateTimelineChartProps>(), {
  data: () => [], label: undefined, width: 640, height: 320, class: undefined,
});

const hoveredKey = ref<string | null>(null);

function handleLeave() {
  hoveredKey.value = null;
}

function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredKey.value = null;
    return;
  }
  hoveredKey.value = target.getAttribute('data-chart-key');
}

const width = computed(() => props.width ?? 640);
const height = computed(() => props.height ?? 320);
const label = computed(() => props.label);

const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

// Normalise start ≤ end, drop non-finite segments and unlabeled lanes.
type ValidSegment = { start: number; end: number; state: string | number; tone?: StateTimelineTone };
type ValidDatum = { series: string; segments: ValidSegment[] };
const validData = computed<ValidDatum[]>(() =>
  (props.data ?? [])
    .filter((d) => typeof d.series === 'string' && d.series.length > 0)
    .map((d) => ({
      series: d.series,
      segments: (d.segments ?? [])
        .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end))
        .map((s) => ({
          start: Math.min(s.start, s.end),
          end: Math.max(s.start, s.end),
          state: s.state,
          tone: s.tone,
        })),
    })),
);

// Distinct states (first-seen order) → categoryN index (1..8, cycled) when
// no explicit `tone`. An explicit `tone` on a segment wins over derivation.
const stateOrder = computed<string[]>(() => {
  const order: string[] = [];
  for (const d of validData.value) {
    for (const s of d.segments) {
      const key = String(s.state);
      if (!order.includes(key)) order.push(key);
    }
  }
  return order;
});
const explicitToneByState = computed(() => {
  const map = new Map<string, StateTimelineTone>();
  for (const d of validData.value) {
    for (const s of d.segments) {
      if (s.tone) map.set(String(s.state), s.tone);
    }
  }
  return map;
});

function toneOf(segment: { state: string | number; tone?: StateTimelineTone }): StateTimelineTone {
  if (segment.tone) return segment.tone;
  const key = String(segment.state);
  const explicit = explicitToneByState.value.get(key);
  if (explicit) return explicit;
  const idx = stateOrder.value.indexOf(key);
  return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as StateTimelineTone;
}

const legendItems = computed(() => stateOrder.value.map((state) => ({ state, tone: toneOf({ state }) })));
const hasLegend = computed(() => stateOrder.value.length > 0);

const vals = computed<number[]>(() => {
  const list: number[] = [];
  for (const d of validData.value) {
    for (const s of d.segments) list.push(s.start, s.end);
  }
  return list;
});
const rawMin = computed(() => (vals.value.length === 0 ? 0 : Math.min(...vals.value)));
const rawMaxBase = computed(() => (vals.value.length === 0 ? 1 : Math.max(...vals.value)));
const rawMax = computed(() => (rawMaxBase.value === rawMin.value ? rawMin.value + 1 : rawMaxBase.value));

const ticks = computed(() => niceTicks(rawMin.value, rawMax.value, 5));
const domainMin = computed(() => ticks.value[0] ?? rawMin.value);
const domainMax = computed(() => ticks.value[ticks.value.length - 1] ?? rawMax.value);

function xOf(v: number): number {
  return MARGIN.left + scaleLinear(v, domainMin.value, domainMax.value, 0, plotWidth.value);
}

type LaneSegment = {
  key: string;
  datum: ValidSegment;
  x: number;
  width: number;
  cx: number;
  tone: StateTimelineTone;
};
type Lane = {
  datum: ValidDatum;
  index: number;
  y: number;
  height: number;
  rowCenterY: number;
  segments: LaneSegment[];
};

const lanes = computed<Lane[]>(() => {
  if (validData.value.length === 0) return [];
  const band = plotHeight.value / validData.value.length;
  const laneHeight = Math.min(band * 0.62, 28);
  return validData.value.map((d, i) => {
    const y = MARGIN.top + band * i + (band - laneHeight) / 2;
    const segments = d.segments.map((s, j) => {
      const x0 = xOf(s.start);
      const x1 = xOf(s.end);
      const x = Math.min(x0, x1);
      const w = Math.max(Math.abs(x1 - x0), 1);
      return { key: `${i}-${j}`, datum: s, x, width: w, cx: x + w / 2, tone: toneOf(s) };
    });
    return { datum: d, index: i, y, height: laneHeight, rowCenterY: MARGIN.top + band * (i + 0.5), segments };
  });
});

const dataValueItems = computed(() =>
  validData.value.map(
    (d) => `${d.series}: ${d.segments.map((s) => `${s.state} [${s.start} → ${s.end}]`).join(', ')}`,
  ),
);

type Hovered = { lane: Lane; seg: LaneSegment } | null;
const hovered = computed<Hovered>(() => {
  if (hoveredKey.value === null) return null;
  for (const lane of lanes.value) {
    for (const seg of lane.segments) {
      if (seg.key === hoveredKey.value) return { lane, seg };
    }
  }
  return null;
});

function isDim(seg: LaneSegment): boolean {
  return hoveredKey.value !== null && hoveredKey.value !== seg.key;
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-stateTimelineChart', props.class)">
    <div
      class="st-stateTimelineChart__visual"
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
        <template v-for="tick in ticks" :key="tick">
          <line class="st-stateTimelineChart__grid" :x1="xOf(tick)" :x2="xOf(tick)" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
          <text class="st-stateTimelineChart__tickLabel" :x="xOf(tick)" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(tick) }}</text>
        </template>
        <line class="st-stateTimelineChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-stateTimelineChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <template v-for="lane in lanes" :key="lane.index">
          <text class="st-stateTimelineChart__seriesLabel" :x="MARGIN.left - 8" :y="lane.rowCenterY" text-anchor="end" dominant-baseline="middle">{{ ellipsize(lane.datum.series, 18) }}</text>
          <rect
            v-for="seg in lane.segments"
            :key="`seg${seg.key}`"
            :class="classNames(
              'st-stateTimelineChart__segment',
              `st-stateTimelineChart__segment--${seg.tone}`,
              isDim(seg) ? 'st-stateTimelineChart__segment--dim' : undefined,
            )"
            :x="seg.x"
            :y="lane.y"
            :width="seg.width"
            :height="lane.height"
            rx="2"
            :data-chart-key="seg.key"
          />
        </template>
      </svg>
    </div>
    <ul v-if="hasLegend" class="st-stateTimelineChart__legend" :aria-label="`États de ${label ?? 'timeline'}`">
      <li v-for="item in legendItems" :key="item.state" class="st-stateTimelineChart__legendItem">
        <span :class="`st-stateTimelineChart__legendSwatch st-stateTimelineChart__legendSwatch--${item.tone}`" aria-hidden="true" />{{ item.state }}
      </li>
    </ul>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label ?? 'state timeline'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-stateTimelineChart__tooltip"
      role="presentation"
      :style="`left:${(hovered.seg.cx / width) * 100}%;top:${(hovered.lane.rowCenterY / height) * 100}%`"
    >
      <span class="st-stateTimelineChart__tooltipLabel">{{ `${hovered.lane.datum.series} · ${hovered.seg.datum.state}` }}</span>
      <span class="st-stateTimelineChart__tooltipValue">{{ `${hovered.seg.datum.start} → ${hovered.seg.datum.end}` }}</span>
    </div>
  </div>
</template>
