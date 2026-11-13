<script setup lang="ts">
import { computed, useId } from 'vue';
import { ref } from 'vue';
import { classNames } from './classNames.js';
import {
  CHART_MARGIN,
  buildLinearPath,
  buildSmoothPath,
  formatTick,
  niceTicks,
  scaleLinear,
} from './chartScale.js';
export type BellCurveChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';
export type BellCurveChartProps = {
  data: number[];
  width?: number;
  height?: number;
  tone?: BellCurveChartTone;
  smooth?: boolean;
  intervals?: number;
  label: string;
  class?: string;
};
const MARGIN = { ...CHART_MARGIN };
const SQRT_2PI = Math.sqrt(2 * Math.PI);

function computeStats(
  sample: number[],
): { mean: number; sd: number; n: number } | null {
  const n = sample.length;
  if (n < 2) return null;
  const mean = sample.reduce((a, b) => a + b, 0) / n;
  const variance =
    sample.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  if (!(sd > 0) || !Number.isFinite(sd)) return null;
  return { mean, sd, n };
}
function pdf(x: number, mean: number, sd: number): number {
  const z = (x - mean) / sd;
  return Math.exp(-(z * z) / 2) / (sd * SQRT_2PI);
}
function roundStat(v: number): number {
  return Math.round(v * 100) / 100;
}
defineOptions({ name: 'BellCurveChart', inheritAttrs: false });
const props = withDefaults(defineProps<BellCurveChartProps>(), {
  data: () => [],
  width: 480,
  height: 240,
  tone: 'category1',
  smooth: true,
  intervals: 64,
  class: undefined,
});

const hoveredIndex = ref<number | null>(null);
const gradientId = 'st-bellcurve-gradient-' + useId();
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
  const smooth = props.smooth ?? true;
  const label = props.label;

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Finite values only.
  const sample = (props.data ?? []).filter((d) => Number.isFinite(d));
  const stats = computeStats(sample);

  const sampleCount = Math.max(8, Math.floor(props.intervals ?? 64) || 64);

  const xDomain = stats
    ? { min: stats.mean - 4 * stats.sd, max: stats.mean + 4 * stats.sd }
    : { min: 0, max: 1 };

  // Peak density at x=μ: pdf(μ) = 1/(σ·√(2π)).
  const yMax = stats ? pdf(stats.mean, stats.mean, stats.sd) : 1;
  const yDomain = { min: 0, max: yMax * 1.08 };

  const xTicks = stats ? niceTicks(xDomain.min, xDomain.max, 5) : [0];

  const baseY = MARGIN.top + plotHeight;

  type CurvePoint = { x: number; y: number; vx: number };
  let curvePoints: CurvePoint[] = [];
  if (stats) {
    for (let i = 0; i <= sampleCount; i++) {
      const vx = xDomain.min + ((xDomain.max - xDomain.min) * i) / sampleCount;
      const vy = pdf(vx, stats.mean, stats.sd);
      curvePoints.push({
        x:
          MARGIN.left + scaleLinear(vx, xDomain.min, xDomain.max, 0, plotWidth),
        y:
          MARGIN.top + scaleLinear(vy, yDomain.min, yDomain.max, plotHeight, 0),
        vx,
      });
    }
  }

  const linePath =
    curvePoints.length === 0
      ? ''
      : smooth
        ? buildSmoothPath(curvePoints)
        : buildLinearPath(curvePoints);

  let areaPath = '';
  if (curvePoints.length !== 0) {
    const first = curvePoints[0];
    const last = curvePoints[curvePoints.length - 1];
    areaPath = `${linePath} L${last.x.toFixed(2)},${baseY.toFixed(2)} L${first.x.toFixed(2)},${baseY.toFixed(2)} Z`;
  }

  const meanMark = stats
    ? {
        x:
          MARGIN.left +
          scaleLinear(stats.mean, xDomain.min, xDomain.max, 0, plotWidth),
        yTop:
          MARGIN.top +
          scaleLinear(yMax, yDomain.min, yDomain.max, plotHeight, 0),
      }
    : null;

  const sdMarks = stats
    ? [-2, -1, 1, 2].map((k) => {
        const vx = stats.mean + k * stats.sd;
        const vy = pdf(vx, stats.mean, stats.sd);
        return {
          k,
          x:
            MARGIN.left +
            scaleLinear(vx, xDomain.min, xDomain.max, 0, plotWidth),
          yTop:
            MARGIN.top +
            scaleLinear(vy, yDomain.min, yDomain.max, plotHeight, 0),
        };
      })
    : [];

  const gridLines = xTicks.map((tick) => ({
    value: tick,
    x: MARGIN.left + scaleLinear(tick, xDomain.min, xDomain.max, 0, plotWidth),
  }));

  const dataValueItems = stats
    ? [
        `Moyenne (μ): ${roundStat(stats.mean)}`,
        `Écart-type (σ): ${roundStat(stats.sd)}`,
        `Taille de l'échantillon (n): ${stats.n}`,
      ]
    : [
        sample.length < 2
          ? 'Échantillon insuffisant (au moins 2 valeurs requises)'
          : 'Écart-type nul (valeurs identiques)',
      ];

  const ariaLabel = stats
    ? `${label} — μ ${roundStat(stats.mean)}, σ ${roundStat(stats.sd)}, n ${stats.n}`
    : label;

  const hoveredPoint =
    hoveredIndex.value !== null ? curvePoints[hoveredIndex.value] : undefined;
  return {
    width,
    height,
    tone,
    smooth,
    label,
    plotWidth,
    plotHeight,
    sample,
    stats,
    sampleCount,
    xDomain,
    yMax,
    yDomain,
    xTicks,
    baseY,
    curvePoints,
    linePath,
    areaPath,
    meanMark,
    sdMarks,
    gridLines,
    dataValueItems,
    ariaLabel,
    hoveredPoint,
  };
});
</script>

<template>
  <div
    v-bind="{ ...($attrs), class: (
      classNames(
        'st-bellCurveChart',
        'st-bellCurveChart--' + geometry.tone,
        props.class,
      )
    ) }"

  >
    <div
      class="st-bellCurveChart__visual"
      role="img"
      :aria-label="geometry.ariaLabel"
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
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.3" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <template v-for="g in geometry.gridLines" :key="g.value">
          <line
            class="st-bellCurveChart__grid"
            :x1="g.x"
            :x2="g.x"
            :y1="MARGIN.top"
            :y2="geometry.baseY"
          />
          <text
            class="st-bellCurveChart__tickLabel"
            :x="g.x"
            :y="geometry.baseY + 16"
            text-anchor="middle"
          >
            {{ formatTick(g.value) }}
          </text>
        </template>
        <line
          class="st-bellCurveChart__axis"
          :x1="MARGIN.left"
          :x2="MARGIN.left"
          :y1="MARGIN.top"
          :y2="geometry.height - MARGIN.bottom"
        />
        <line
          class="st-bellCurveChart__axis"
          :x1="MARGIN.left"
          :x2="geometry.width - MARGIN.right"
          :y1="geometry.height - MARGIN.bottom"
          :y2="geometry.height - MARGIN.bottom"
        />

        <path
          v-if="geometry.areaPath"
          class="st-bellCurveChart__area"
          :d="geometry.areaPath"
          :fill="`url(#${gradientId})`"
        />
        <path
          v-if="geometry.linePath"
          class="st-bellCurveChart__line"
          :d="geometry.linePath"
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <line
          v-for="m in geometry.sdMarks"
          :key="m.k"
          class="st-bellCurveChart__sdMark"
          :x1="m.x"
          :x2="m.x"
          :y1="m.yTop"
          :y2="geometry.baseY"
        />
        <template v-if="geometry.meanMark">
          <line
            class="st-bellCurveChart__mean"
            :x1="geometry.meanMark.x"
            :x2="geometry.meanMark.x"
            :y1="geometry.meanMark.yTop"
            :y2="geometry.baseY"
          />
          <text
            class="st-bellCurveChart__meanLabel"
            :x="geometry.meanMark.x"
            :y="MARGIN.top - 2"
            text-anchor="middle"
          >{{ 'μ' }}</text>
        </template>
        <circle
          v-for="(p, i) in geometry.curvePoints"
          :key="i"
          class="st-bellCurveChart__hit"
          :cx="p.x"
          :cy="p.y"
          r="6"
          :data-chart-index="i"
        />
      </svg>
    </div>
    <ul
      v-if="geometry.dataValueItems.length"
      class="st-chartDataList"
      :aria-label="'Data values for ' + geometry.ariaLabel"
    >
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="geometry.hoveredPoint"
      class="st-bellCurveChart__tooltip"
      role="presentation"
      :style="`left: ${(geometry.hoveredPoint.x / geometry.width) * 100}%; top: ${(geometry.hoveredPoint.y / geometry.height) * 100}%`"
    >
      <span class="st-bellCurveChart__tooltipValue">{{
        roundStat(geometry.hoveredPoint.vx)
      }}</span>
    </div>
  </div>
</template>
