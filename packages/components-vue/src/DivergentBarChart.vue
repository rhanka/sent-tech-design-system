<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type DivergentBarChartTone = 'positive' | 'negative' | 'neutral';

export type DivergentBarChartDatum = {
  label: string;
  value: number;
  tone?: DivergentBarChartTone;
};

export type DivergentBarChartProps = {
  data: DivergentBarChartDatum[];
  width?: number;
  height?: number;
  domain?: [number, number];
  format?: (value: number) => string;
  showLegend?: boolean;
  label: string;
  class?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 34, left: 88 } as const;

const signFor = (value: number): 'positive' | 'negative' | 'zero' => {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'zero';
};

const toneFor = (datum: DivergentBarChartDatum): DivergentBarChartTone => {
  if (datum.tone) return datum.tone;
  if (datum.value > 0) return 'positive';
  if (datum.value < 0) return 'negative';
  return 'neutral';
};

const resolveDomain = (data: DivergentBarChartDatum[], domain?: [number, number]) => {
  const plotDomain =
    domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] < domain[1] && domain[0] <= 0 && domain[1] >= 0
      ? domain
      : null;

  if (plotDomain) {
    const ticks = niceTicks(plotDomain[0], plotDomain[1]).filter((tick) => tick >= plotDomain[0] && tick <= plotDomain[1]);
    return { domainMin: plotDomain[0], domainMax: plotDomain[1], ticks: ticks.length ? ticks : [0] };
  }

  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  const ticks = niceTicks(-maxAbs, maxAbs);
  return { domainMin: ticks[0], domainMax: ticks[ticks.length - 1], ticks };
};

defineOptions({ name: 'DivergentBarChart', inheritAttrs: false });
const props = withDefaults(defineProps<DivergentBarChartProps>(), {
  width: 480,
  height: 260,
  domain: undefined,
  format: undefined,
  showLegend: true,
  class: undefined,
});

const hoveredIndex = ref<number | null>(null);

const handleVisualPointerMove = (event: PointerEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    return;
  }
  const index = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(index) ? index : null;
};
const handleLeave = () => {
  hoveredIndex.value = null;
};

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 260);
const formatter = computed(() => props.format ?? formatTick);
const validData = computed(() => props.data.filter((d) => Number.isFinite(d.value)));
const domain = computed(() => resolveDomain(validData.value, props.domain));
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));
const zeroAxisX = computed(() => MARGIN.left + scaleLinear(0, domain.value.domainMin, domain.value.domainMax, 0, plotWidth.value));

const bars = computed(() =>
  validData.value.length === 0
    ? []
    : validData.value.map((datum, index) => {
        const band = plotHeight.value / validData.value.length;
        const barHeight = Math.max(band * 0.56, 1);
        const valueX = MARGIN.left + scaleLinear(datum.value, domain.value.domainMin, domain.value.domainMax, 0, plotWidth.value);
        const x = Math.min(zeroAxisX.value, valueX);
        const barWidth = Math.max(Math.abs(valueX - zeroAxisX.value), 0.5);
        const y = MARGIN.top + band * index + (band - barHeight) / 2;
        return {
          datum,
          index,
          x,
          y,
          width: barWidth,
          height: barHeight,
          cx: datum.value === 0 ? zeroAxisX.value : x + barWidth / 2,
          cy: y + barHeight / 2,
          sign: signFor(datum.value),
          tone: toneFor(datum),
        };
      }),
);

const grid = computed(() => domain.value.ticks.map((tick) => {
  const x = MARGIN.left + scaleLinear(tick, domain.value.domainMin, domain.value.domainMax, 0, plotWidth.value);
  return { tick, x };
}));

const chartDataListItems = computed(() => validData.value.map((d) => `${d.label}: ${formatter.value(d.value)}`));

const hoveredBar = computed(() => (hoveredIndex.value !== null ? bars.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-divergentBarChart', props.class)) }" >
    <div class="st-divergentBarChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="g in grid" :key="g.tick">
          <line class="st-divergentBarChart__grid" :x1="g.x" :x2="g.x" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
          <text class="st-divergentBarChart__tickLabel" :x="g.x" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(g.tick) }}</text>
        </template>
        <line class="st-divergentBarChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom"></line>
        <line class="st-divergentBarChart__zeroAxis" :x1="zeroAxisX" :x2="zeroAxisX" :y1="MARGIN.top" :y2="height - MARGIN.bottom"></line>
        <template v-for="bar in bars" :key="bar.datum.label">
          <text class="st-divergentBarChart__categoryLabel" :x="MARGIN.left - 8" :y="bar.cy" text-anchor="end" dominant-baseline="middle">{{ bar.datum.label }}</text>
          <rect :class="classNames('st-divergentBarChart__bar', `st-divergentBarChart__bar--${bar.sign}`, `st-divergentBarChart__bar--${bar.tone}`)" :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" rx="2" :data-chart-index="bar.index" :data-chart-key="bar.datum.label" @pointermove="handleVisualPointerMove"></rect>
        </template>
      </svg>
    </div>
    <ul v-if="chartDataListItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in chartDataListItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredBar" class="st-divergentBarChart__tooltip" role="presentation" :style="{ left: `${(hoveredBar.cx / width) * 100}%`, top: `${(hoveredBar.cy / height) * 100}%` }">
      <span class="st-divergentBarChart__tooltipLabel">{{ hoveredBar.datum.label }}</span>
      <span class="st-divergentBarChart__tooltipValue">{{ formatter(hoveredBar.datum.value) }}</span>
    </div>
    <ul v-if="props.showLegend" class="st-divergentBarChart__legend">
      <li class="st-divergentBarChart__legendItem"><span class="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--positive" aria-hidden="true"></span>Positive</li>
      <li class="st-divergentBarChart__legendItem"><span class="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--negative" aria-hidden="true"></span>Negative</li>
      <li class="st-divergentBarChart__legendItem"><span class="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--neutral" aria-hidden="true"></span>Zero</li>
    </ul>
  </div>
</template>
