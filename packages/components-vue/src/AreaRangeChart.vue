<script setup lang="ts">
import { computed, useId, useAttrs } from 'vue';
import { ref } from 'vue';
import { classNames } from './classNames.js';
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from './chartScale.js';
export type AreaRangeChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';
export type AreaRangeChartDatum = {
  x: number | string;
  low: number;
  high: number;
};
export type AreaRangeChartProps = {
  data: AreaRangeChartDatum[];
  width?: number;
  height?: number;
  tone?: AreaRangeChartTone;
  smooth?: boolean;
  label: string;
  class?: string;
};
const MARGIN = CHART_MARGIN;

function normalize(d: AreaRangeChartDatum): { lo: number; hi: number } | null {
  if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
}
function continuePath(
  prefix: string,
  pts: { x: number; y: number }[],
  curve: boolean,
): string {
  if (pts.length === 0) return prefix;
  const full = curve ? buildSmoothPath(pts) : buildLinearPath(pts);
  return `${prefix} L${full.slice(1)}`;
}
defineOptions({ name: 'AreaRangeChart', inheritAttrs: false });
const props = withDefaults(defineProps<AreaRangeChartProps>(), {
  data: () => [],
  width: 480,
  height: 240,
  tone: 'category1',
  smooth: false,
  class: undefined,
});
const attrs = useAttrs();
const hoveredIndex = ref<number | null>(null);
const gradientId = 'st-arearangechart-gradient-' + useId();
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
const geometry = computed(() => {
  const width = props.width ?? 480;
  const height = props.height ?? 240;
  const tone = props.tone ?? 'category1';
  const smooth = props.smooth ?? false;
  const label = props.label;

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Valid data: finite low + high.
  const validData = (props.data ?? []).filter((d) => normalize(d) !== null);

  const dataValueItems = validData.map((d) => {
    const r = normalize(d)!;
    return `${d.x}: ${r.lo} – ${r.hi}`;
  });

  let xDomain:
    | { kind: 'ordinal'; values: (number | string)[] }
    | { kind: 'numeric'; min: number; max: number };
  if (validData.length === 0) {
    xDomain = { kind: 'ordinal', values: [] };
  } else if (validData.every((d) => isNumeric(d.x))) {
    const xs = validData.map((d) => d.x as number);
    xDomain = { kind: 'numeric', min: Math.min(...xs), max: Math.max(...xs) };
  } else {
    xDomain = { kind: 'ordinal', values: validData.map((d) => d.x) };
  }

  let yTicks: number[];
  if (validData.length === 0) {
    yTicks = [0];
  } else {
    const lows = validData.map((d) => normalize(d)!.lo);
    const highs = validData.map((d) => normalize(d)!.hi);
    const yMin = Math.min(...lows);
    const yMax = Math.max(...highs);
    const padded = (yMax - yMin) * 0.08 || Math.max(Math.abs(yMax), 1) * 0.1;
    yTicks = niceTicks(yMin - padded, yMax + padded, 5);
  }
  const yDomain =
    yTicks.length === 0
      ? { min: 0, max: 1 }
      : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

  type RangePoint = {
    x: number;
    yLow: number;
    yHigh: number;
    datum: AreaRangeChartDatum;
    range: { lo: number; hi: number };
    index: number;
  };
  let points: RangePoint[] = [];
  if (validData.length !== 0) {
    points = validData.map((d, i) => {
      let x: number;
      if (xDomain.kind === 'numeric') {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(validData.length - 1, 1);
        x = validData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const r = normalize(d)!;
      const yLow = scaleLinear(r.lo, yDomain.min, yDomain.max, plotHeight, 0);
      const yHigh = scaleLinear(r.hi, yDomain.min, yDomain.max, plotHeight, 0);
      return {
        x: MARGIN.left + x,
        yLow: MARGIN.top + yLow,
        yHigh: MARGIN.top + yHigh,
        datum: d,
        range: r,
        index: i,
      };
    });
  }

  const highPts = points.map((p) => ({ x: p.x, y: p.yHigh }));
  const lowPts = points.map((p) => ({ x: p.x, y: p.yLow }));
  const highPath =
    points.length === 0
      ? ''
      : smooth
        ? buildSmoothPath(highPts)
        : buildLinearPath(highPts);
  const lowPath =
    points.length === 0
      ? ''
      : smooth
        ? buildSmoothPath(lowPts)
        : buildLinearPath(lowPts);

  let areaPath = '';
  if (points.length !== 0) {
    const lowReversed = [...points]
      .reverse()
      .map((p) => ({ x: p.x, y: p.yLow }));
    areaPath = `${continuePath(highPath, lowReversed, smooth)} Z`;
  }

  const gridLines = yTicks.map((tick) => ({
    value: tick,
    y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
  }));

  let xTickEntries: { x: number; label: string }[] = [];
  if (validData.length !== 0) {
    if (xDomain.kind === 'ordinal') {
      xTickEntries = points.map((p, i) => ({
        x: p.x,
        label: String(validData[i].x),
      }));
    } else {
      const target = Math.min(5, validData.length);
      const stride = Math.max(
        1,
        Math.round((validData.length - 1) / (target - 1 || 1)),
      );
      for (let i = 0; i < validData.length; i += stride) {
        xTickEntries.push({ x: points[i].x, label: String(validData[i].x) });
      }
      const lastIdx = validData.length - 1;
      if (
        xTickEntries[xTickEntries.length - 1]?.label !==
        String(validData[lastIdx].x)
      ) {
        xTickEntries.push({
          x: points[lastIdx].x,
          label: String(validData[lastIdx].x),
        });
      }
    }
  }

  const hoveredPoint =
    hoveredIndex.value !== null ? points[hoveredIndex.value] : undefined;
  return {
    width,
    height,
    tone,
    smooth,
    label,
    plotWidth,
    plotHeight,
    validData,
    dataValueItems,
    xDomain,
    yTicks,
    yDomain,
    points,
    highPts,
    lowPts,
    highPath,
    lowPath,
    areaPath,
    gridLines,
    xTickEntries,
    hoveredPoint,
  };
});
</script>

<template>
  <div
    v-bind="{ ...($attrs), class: (
      classNames(
        'st-areaRangeChart',
        'st-areaRangeChart--' + geometry.tone,
        props.class,
      )
    ) }"

  >
    <div
      class="st-areaRangeChart__visual"
      role="img"
      :aria-label="geometry.label"
      @pointermove="handleVisualPointerMove"
      @pointerleave="handleLeave"
    >
      <svg
        :viewBox="`0 0 ${geometry.width} ${geometry.height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.32" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0.12" />
          </linearGradient>
        </defs>
        <template v-for="g in geometry.gridLines" :key="g.value">
          <line
            class="st-areaRangeChart__grid"
            :x1="MARGIN.left"
            :x2="geometry.width - MARGIN.right"
            :y1="g.y"
            :y2="g.y"
          />
          <text
            class="st-areaRangeChart__tickLabel"
            :x="MARGIN.left - 6"
            :y="g.y"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {{ formatTick(g.value) }}
          </text>
        </template>
        <line
          class="st-areaRangeChart__axis"
          :x1="MARGIN.left"
          :x2="MARGIN.left"
          :y1="MARGIN.top"
          :y2="geometry.height - MARGIN.bottom"
        />
        <line
          class="st-areaRangeChart__axis"
          :x1="MARGIN.left"
          :x2="geometry.width - MARGIN.right"
          :y1="geometry.height - MARGIN.bottom"
          :y2="geometry.height - MARGIN.bottom"
        />
        <text
          v-for="(tick, i) in geometry.xTickEntries"
          :key="i"
          class="st-areaRangeChart__tickLabel"
          :x="tick.x"
          :y="geometry.height - MARGIN.bottom + 16"
          text-anchor="middle"
        >
          {{ tick.label }}
        </text>
        <path
          v-if="geometry.areaPath"
          class="st-areaRangeChart__area"
          :d="geometry.areaPath"
          :fill="`url(#${gradientId})`"
        />
        <path
          v-if="geometry.highPath"
          class="st-areaRangeChart__line st-areaRangeChart__line--high"
          :d="geometry.highPath"
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          v-if="geometry.lowPath"
          class="st-areaRangeChart__line st-areaRangeChart__line--low"
          :d="geometry.lowPath"
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <template v-for="p in geometry.points" :key="p.index">
          <circle
            class="st-areaRangeChart__dot"
            :cx="p.x"
            :cy="p.yHigh"
            r="3.5"
            :data-chart-index="p.index"
          />
          <circle
            class="st-areaRangeChart__dot"
            :cx="p.x"
            :cy="p.yLow"
            r="3.5"
            :data-chart-index="p.index"
          />
        </template>
      </svg>
    </div>
    <ul
      v-if="geometry.dataValueItems.length"
      class="st-chartDataList"
      :aria-label="'Data values for ' + geometry.label"
    >
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="geometry.hoveredPoint"
      class="st-areaRangeChart__tooltip"
      role="presentation"
      :style="`left: ${(geometry.hoveredPoint.x / geometry.width) * 100}%; top: ${(geometry.hoveredPoint.yHigh / geometry.height) * 100}%`"
    >
      <span class="st-areaRangeChart__tooltipLabel">{{
        String(geometry.hoveredPoint.datum.x)
      }}</span
      ><span class="st-areaRangeChart__tooltipValue"
        >{{ geometry.hoveredPoint.range.lo }} –
        {{ geometry.hoveredPoint.range.hi }}</span
      >
    </div>
  </div>
</template>
