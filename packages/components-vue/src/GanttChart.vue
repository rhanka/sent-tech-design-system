<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type GanttChartTask = {
  task: string;
  start: number;
  end: number;
  category?: string;
};

export type GanttChartProps = {
  data: GanttChartTask[];
  label: string;
  width?: number;
  height?: number;
  marker?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

defineOptions({ name: 'GanttChart', inheritAttrs: false });
const props = withDefaults(defineProps<GanttChartProps>(), {
  data: () => [], width: 640, height: 320, marker: undefined, class: undefined,
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

// Truncate a label to the left margin width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return '…';
  return `${text.slice(0, maxChars - 1)}…`;
}

const validData = computed(() => {
  const data = props.data ?? [];
  return data
    .filter(
      (d) =>
        typeof d.task === 'string' &&
        d.task.length > 0 &&
        Number.isFinite(d.start) &&
        Number.isFinite(d.end),
    )
    .map((d) => ({
      task: d.task,
      start: Math.min(d.start, d.end),
      end: Math.max(d.start, d.end),
      category: d.category,
    }));
});

const hasCategories = computed(() => validData.value.some((d) => d.category));

const legendItems = computed(() => {
  const categoryOrder: string[] = [];
  for (const d of validData.value) {
    if (d.category && !categoryOrder.includes(d.category)) categoryOrder.push(d.category);
  }
  return categoryOrder.map((category) => ({
    category,
    tone: `category${(categoryOrder.indexOf(category) % 8) + 1}`,
  }));
});

const marker = computed(() => props.marker);

const geometry = computed(() => {
  const width = props.width ?? 640;
  const height = props.height ?? 320;
  const markerValue = marker.value;
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const vals: number[] = [];
  for (const d of validData.value) vals.push(d.start, d.end);
  if (typeof markerValue === 'number' && Number.isFinite(markerValue)) vals.push(markerValue);
  const rawMin = vals.length === 0 ? 0 : Math.min(...vals);
  const rawMaxBase = vals.length === 0 ? 1 : Math.max(...vals);
  const rawMax = rawMaxBase === rawMin ? rawMin + 1 : rawMaxBase;
  const ticks = niceTicks(rawMin, rawMax, 5);
  const domainMin = ticks[0] ?? rawMin;
  const domainMax = ticks[ticks.length - 1] ?? rawMax;
  const xOf = (v: number) => MARGIN.left + scaleLinear(v, domainMin, domainMax, 0, plotWidth);
  const toneOf = (category: string | undefined): string => {
    if (!category) return 'category1';
    const categoryOrder = legendItems.value.map((item) => item.category);
    const idx = categoryOrder.indexOf(category);
    return `category${(idx % 8) + 1}`;
  };
  type Bar = {
    datum: (typeof validData.value)[number];
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rowCenterY: number;
    cx: number;
    tone: string;
  };
  let bars: Bar[] = [];
  if (validData.value.length > 0) {
    const band = plotHeight / validData.value.length;
    const barHeight = Math.min(band * 0.62, 28);
    bars = validData.value.map((d, i) => {
      const x0 = xOf(d.start);
      const x1 = xOf(d.end);
      const x = Math.min(x0, x1);
      const w = Math.max(Math.abs(x1 - x0), 1);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        datum: d,
        index: i,
        x,
        y,
        width: w,
        height: barHeight,
        rowCenterY: MARGIN.top + band * (i + 0.5),
        cx: x + w / 2,
        tone: toneOf(d.category),
      };
    });
  }
  const markerGeom =
    typeof markerValue === 'number' && Number.isFinite(markerValue) ? { x: xOf(markerValue), value: markerValue } : null;
  return { ticks, xOf, bars, markerGeom, width, height };
});

const dataValueItems = computed(() => validData.value.map((d) => `${d.task}: ${d.start} → ${d.end}`));

const hoveredIndex = ref<number | null>(null);
const hoveredBar = computed(() => {
  if (hoveredIndex.value === null) return undefined;
  return geometry.value.bars[hoveredIndex.value];
});

function handleLeave() {
  hoveredIndex.value = null;
}

function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    return;
  }
  const idx = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(idx) ? idx : null;
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-ganttChart', props.class)">
    <div class="st-ganttChart__visual" role="img" :aria-label="props.label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${geometry.width} ${geometry.height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="tick in geometry.ticks" :key="`g${tick}`">
          <line class="st-ganttChart__grid" :x1="geometry.xOf(tick)" :x2="geometry.xOf(tick)" :y1="16" :y2="geometry.height - 32" />
          <text class="st-ganttChart__tickLabel" :x="geometry.xOf(tick)" :y="geometry.height - 32 + 16" text-anchor="middle">{{ formatTick(tick) }}</text>
        </template>
        <line class="st-ganttChart__axis" :x1="132" :x2="132" :y1="16" :y2="geometry.height - 32" />
        <line class="st-ganttChart__axis" :x1="132" :x2="geometry.width - 16" :y1="geometry.height - 32" :y2="geometry.height - 32" />
        <template v-for="bar in geometry.bars" :key="`b${bar.index}`">
          <text class="st-ganttChart__taskLabel" :x="132 - 8" :y="bar.rowCenterY" text-anchor="end" dominant-baseline="middle">{{ ellipsize(bar.datum.task, 18) }}</text>
          <rect :class="classNames('st-ganttChart__bar', `st-ganttChart__bar--${bar.tone}`, hoveredIndex !== null && hoveredIndex !== bar.index ? 'st-ganttChart__bar--dim' : undefined)" :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" rx="2" :data-chart-index="bar.index" />
        </template>
        <line v-if="geometry.markerGeom" class="st-ganttChart__marker" :x1="geometry.markerGeom.x" :x2="geometry.markerGeom.x" :y1="16" :y2="geometry.height - 32" />
      </svg>
    </div>
    <ul v-if="hasCategories" class="st-ganttChart__legend" :aria-label="`Catégories de ${props.label}`">
      <li v-for="item in legendItems" :key="item.category" class="st-ganttChart__legendItem"><span :class="`st-ganttChart__legendSwatch st-ganttChart__legendSwatch--${item.tone}`" aria-hidden="true"></span>{{ item.category }}</li>
    </ul>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredBar" class="st-ganttChart__tooltip" role="presentation" :style="`left:${(hoveredBar.cx / geometry.width) * 100}%;top:${(hoveredBar.rowCenterY / geometry.height) * 100}%`">
      <span class="st-ganttChart__tooltipLabel">{{ hoveredBar.datum.task }}</span><span class="st-ganttChart__tooltipValue">{{ `${hoveredBar.datum.start} → ${hoveredBar.datum.end}` }}</span>
    </div>
  </div>
</template>
