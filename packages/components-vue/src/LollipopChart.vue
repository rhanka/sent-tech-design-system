<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';
import { contrastTextForTone } from './chartContrast.js';

export type LollipopChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type LollipopChartDatum = {
  label: string;
  value: number;
  tone?: LollipopChartTone;
};

export type LollipopChartProps = {
  data: LollipopChartDatum[];
  width?: number;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * LollipopCharts in a grid share one scale. When absent or invalid, the scale
   * falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  class?: string;
};

const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };
const DOT_RADIUS = 5;

defineOptions({ name: 'LollipopChart', inheritAttrs: false });
const props = withDefaults(defineProps<LollipopChartProps>(), {
  data: () => [], width: 480, height: 240, orientation: 'vertical', domain: undefined, class: undefined,
});

const geometry = computed(() => {
  const width = props.width ?? 480;
  const height = props.height ?? 240;
  const orientation = props.orientation ?? 'vertical';
  const data = props.data ?? [];

  // Valid data: finite value.
  const validData = data.filter((d) => Number.isFinite(d.value));

  // A domain is honoured only when finite and ordered (min < max).
  const domain = props.domain;
  const validDomain: [number, number] | null =
    domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] < domain[1]
      ? [domain[0], domain[1]]
      : null;

  const values = validData.map((d) => d.value);
  const minRaw = validDomain ? validDomain[0] : Math.min(0, ...values);
  const maxRaw = validDomain ? validDomain[1] : Math.max(0, ...values);
  const ticks = niceTicks(minRaw, maxRaw, 5);
  const domainMin = ticks[0];
  const domainMax = ticks[ticks.length - 1];
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  type Lollipop = {
    datum: LollipopChartDatum;
    tone: LollipopChartTone;
    stemX1: number;
    stemY1: number;
    stemX2: number;
    stemY2: number;
    cx: number;
    cy: number;
    labelX: number;
    labelY: number;
  };

  let lollipops: Lollipop[] = [];
  if (validData.length !== 0) {
    if (orientation === 'vertical') {
      const band = plotWidth / validData.length;
      const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
      lollipops = validData.map((d, i) => {
        const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
        const cx = MARGIN.left + band * (i + 0.5);
        return {
          datum: d,
          tone: (d.tone ?? 'category1') as LollipopChartTone,
          stemX1: cx,
          stemY1: MARGIN.top + zeroY,
          stemX2: cx,
          stemY2: MARGIN.top + valueY,
          cx,
          cy: MARGIN.top + valueY,
          labelX: cx,
          labelY: height - MARGIN.bottom + 16,
        };
      });
    } else {
      // horizontal
      const band = plotHeight / validData.length;
      const zeroX = scaleLinear(0, domainMin, domainMax, 0, plotWidth);
      lollipops = validData.map((d, i) => {
        const valueX = scaleLinear(d.value, domainMin, domainMax, 0, plotWidth);
        const cy = MARGIN.top + band * (i + 0.5);
        return {
          datum: d,
          tone: (d.tone ?? 'category1') as LollipopChartTone,
          stemX1: MARGIN.left + zeroX,
          stemY1: cy,
          stemX2: MARGIN.left + valueX,
          stemY2: cy,
          cx: MARGIN.left + valueX,
          cy,
          labelX: MARGIN.left - 6,
          labelY: cy,
        };
      });
    }
  }

  const dataValueItems = validData.map((d) => `${d.label}: ${d.value}`);

  const valueAxisTicks = ticks.map((tick) => {
    if (orientation === 'vertical') {
      return {
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + plotWidth,
        y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
        x: undefined as number | undefined,
        y1: undefined as number | undefined,
        y2: undefined as number | undefined,
      };
    }
    return {
      value: tick,
      x: MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth),
      y1: MARGIN.top,
      y2: MARGIN.top + plotHeight,
      x1: undefined as number | undefined,
      x2: undefined as number | undefined,
      y: undefined as number | undefined,
    };
  });

  return { width, height, orientation, ticks, valueAxisTicks, lollipops, dataValueItems };
});

const hoveredIndex = ref<number | null>(null);
const hovered = computed(() => (hoveredIndex.value !== null ? geometry.value.lollipops[hoveredIndex.value] : undefined));

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
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-lollipopChart', props.class)">
    <div class="st-lollipopChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${geometry.width} ${geometry.height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="tick in geometry.valueAxisTicks" :key="`g${tick.value}`">
          <template v-if="geometry.orientation === 'vertical'">
            <line class="st-lollipopChart__grid" :x1="tick.x1" :x2="tick.x2" :y1="tick.y" :y2="tick.y" />
            <text class="st-lollipopChart__tickLabel" :x="MARGIN.left - 6" :y="tick.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick.value) }}</text>
          </template>
          <template v-else>
            <line class="st-lollipopChart__grid" :x1="tick.x" :x2="tick.x" :y1="tick.y1" :y2="tick.y2" />
            <text class="st-lollipopChart__tickLabel" :x="tick.x" :y="geometry.height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(tick.value) }}</text>
          </template>
        </template>
        <line class="st-lollipopChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="geometry.height - MARGIN.bottom" />
        <line class="st-lollipopChart__axis" :x1="MARGIN.left" :x2="geometry.width - MARGIN.right" :y1="geometry.height - MARGIN.bottom" :y2="geometry.height - MARGIN.bottom" />
        <text v-for="pop in geometry.lollipops" :key="`cat-${pop.datum.label}`" class="st-lollipopChart__categoryLabel" :x="pop.labelX" :y="pop.labelY" :text-anchor="geometry.orientation === 'vertical' ? 'middle' : 'end'" :dominant-baseline="geometry.orientation === 'vertical' ? undefined : 'middle'">{{ pop.datum.label }}</text>
        <template v-for="(pop, i) in geometry.lollipops" :key="`p${i}`">
          <line class="st-lollipopChart__stem" :x1="pop.stemX1" :y1="pop.stemY1" :x2="pop.stemX2" :y2="pop.stemY2" />
          <circle :class="`st-lollipopChart__dot st-lollipopChart__dot--${pop.tone}`" :cx="pop.cx" :cy="pop.cy" :r="DOT_RADIUS" :data-chart-index="i" />
          <text class="st-lollipopChart__valueLabel" :x="pop.cx" :y="geometry.orientation === 'vertical' ? pop.cy - DOT_RADIUS - 4 : pop.cy" :dx="geometry.orientation === 'vertical' ? 0 : DOT_RADIUS + 4" :text-anchor="geometry.orientation === 'vertical' ? 'middle' : 'start'" :dominant-baseline="geometry.orientation === 'vertical' ? 'auto' : 'middle'" :style="`fill: ${contrastTextForTone(pop.tone)}`">{{ formatTick(pop.datum.value) }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="geometry.dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-lollipopChart__tooltip" role="presentation" :style="`left: ${(hovered.cx / geometry.width) * 100}%; top: ${(hovered.cy / geometry.height) * 100}%`">
      <span class="st-lollipopChart__tooltipLabel">{{ hovered.datum.label }}</span><span class="st-lollipopChart__tooltipValue">{{ String(hovered.datum.value) }}</span>
    </div>
  </div>
</template>
