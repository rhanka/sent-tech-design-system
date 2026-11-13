<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type PolygonChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type PolygonChartPoint = {
  x: number;
  y: number;
};

export type PolygonChartProps = {
  data: PolygonChartPoint[];
  label: string;
  tone?: PolygonChartTone;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 } as const;

defineOptions({ name: 'PolygonChart', inheritAttrs: false });
const props = withDefaults(defineProps<PolygonChartProps>(), {
  tone: 'category1', width: 480, height: 360, class: undefined,
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
const height = computed(() => props.height ?? 360);
const tone = computed(() => props.tone ?? 'category1');

// Non-finite coordinates are dropped before anything else.
const validData = computed(() => (props.data ?? []).filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y)));

const xs = computed(() => validData.value.map((d) => d.x));
const ys = computed(() => validData.value.map((d) => d.y));
const xTicks = computed(() => niceTicks(Math.min(...xs.value), Math.max(...xs.value)) as number[]);
const yTicks = computed(() => niceTicks(Math.min(...ys.value), Math.max(...ys.value)) as number[]);
const plotW = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotH = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));
const xMin = computed(() => xTicks.value[0]);
const xMax = computed(() => xTicks.value[xTicks.value.length - 1]);
const yMin = computed(() => yTicks.value[0]);
const yMax = computed(() => yTicks.value[yTicks.value.length - 1]);

const points = computed(() => validData.value.map((d) => ({
  cx: MARGIN.left + scaleLinear(d.x, xMin.value, xMax.value, 0, plotW.value),
  cy: MARGIN.top + scaleLinear(d.y, yMin.value, yMax.value, plotH.value, 0),
  datum: d,
})));

const polygonPoints = computed(() => points.value.map((p) => `${p.cx},${p.cy}`).join(' '));

const dataValueItems = computed(() => validData.value.map((d) => `x ${d.x}, y ${d.y}`));

const yTickYs = computed(() => yTicks.value.map((t) => ({
  t,
  y: MARGIN.top + scaleLinear(t, yMin.value, yMax.value, plotH.value, 0),
})));
const xTickXs = computed(() => xTicks.value.map((t) => ({
  t,
  x: MARGIN.left + scaleLinear(t, xMin.value, xMax.value, 0, plotW.value),
})));

const hovered = computed(() => (hoveredIndex.value !== null ? points.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-polygonChart', props.class)">
    <div
      class="st-polygonChart__visual"
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
        <template v-for="entry in yTickYs" :key="`gy${entry.t}`">
          <line class="st-polygonChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="entry.y" :y2="entry.y" />
          <text class="st-polygonChart__tick" :x="MARGIN.left - 6" :y="entry.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(entry.t) }}</text>
        </template>
        <text v-for="entry in xTickXs" :key="`tx${entry.t}`" class="st-polygonChart__tick" :x="entry.x" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(entry.t) }}</text>
        <line class="st-polygonChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-polygonChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <polygon
          v-if="points.length >= 2"
          :class="classNames('st-polygonChart__polygon', `st-polygonChart__polygon--${tone}`)"
          :points="polygonPoints"
        />
        <circle
          v-for="(p, i) in points"
          :key="`v${i}`"
          :class="classNames('st-polygonChart__vertex', `st-polygonChart__vertex--${tone}`)"
          :cx="p.cx"
          :cy="p.cy"
          r="3.5"
          :data-chart-index="i"
        />
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-polygonChart__tooltip"
      role="presentation"
      :style="`left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`"
    >
      <span class="st-polygonChart__tooltipValue">{{ `x ${hovered.datum.x} · y ${hovered.datum.y}` }}</span>
    </div>
  </div>
</template>
