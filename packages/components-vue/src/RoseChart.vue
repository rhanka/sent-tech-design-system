<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { contrastTextForTone } from './chartContrast.js';

export type RoseChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type RoseChartDatum = {
  label: string;
  value: number;
  tone?: RoseChartTone;
};

export type RoseChartProps = {
  data: RoseChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: RoseChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

function safeValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, '');
}

function point(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function sectorPath(cx: number, cy: number, radius: number, start: number, end: number): string {
  const safeEnd = Math.min(end, start + Math.PI * 2 - 0.0001);
  const large = safeEnd - start > Math.PI ? 1 : 0;
  const outerStart = point(cx, cy, radius, start);
  const outerEnd = point(cx, cy, radius, safeEnd);
  return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} Z`;
}

defineOptions({ name: 'RoseChart', inheritAttrs: false });
const props = withDefaults(defineProps<RoseChartProps>(), {
  width: 320, height: 320, class: undefined,
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

const width = computed(() => props.width ?? 320);
const height = computed(() => props.height ?? 320);
const label = computed(() => props.label);
const dataList = computed(() => props.data ?? []);

const cx = computed(() => width.value / 2);
const cy = computed(() => height.value / 2);
const outerLimit = computed(() => Math.max(Math.min(width.value, height.value) / 2 - 6, 1));
const count = computed(() => dataList.value.length);
const maxValue = computed(() => Math.max(0, ...dataList.value.map((datum) => safeValue(datum.value))));
const safeMax = computed(() => (maxValue.value > 0 ? maxValue.value : 1));
const sweep = computed(() => (count.value > 0 ? (Math.PI * 2) / count.value : Math.PI * 2));

type Sector = {
  datum: RoseChartDatum;
  value: number;
  tone: RoseChartTone;
  radius: number;
  path: string;
  labelX: number;
  labelY: number;
  showLabel: boolean;
};
const sectors = computed<Sector[]>(() =>
  dataList.value.map((datum, index) => {
    const value = safeValue(datum.value);
    const radius = Math.sqrt(value / safeMax.value) * outerLimit.value;
    const start = -Math.PI / 2 + sweep.value * index;
    const end = start + sweep.value;
    const midAngle = (start + end) / 2;
    const labelPoint = point(cx.value, cy.value, radius * 0.62, midAngle);
    return {
      datum,
      value,
      tone: datum.tone ?? TONES[index % TONES.length],
      radius,
      path: value > 0 ? sectorPath(cx.value, cy.value, radius, start, end) : '',
      labelX: labelPoint.x,
      labelY: labelPoint.y,
      showLabel: value > 0 && radius > outerLimit.value * 0.4,
    };
  }),
);

const dataValueItems = computed(() =>
  dataList.value.map((datum) => `${datum.label}: ${formatNumber(safeValue(datum.value))}`),
);
const hovered = computed(() =>
  hoveredIndex.value !== null ? sectors.value[hoveredIndex.value] : undefined,
);

function isDim(i: number): boolean {
  return hoveredIndex.value !== null && hoveredIndex.value !== i;
}
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-roseChart', props.class)) }" >
    <div
      class="st-roseChart__visual"
      role="img"
      :aria-label="label"
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
        <template v-for="(sector, i) in sectors" :key="`s${sector.datum.label}`">
          <path
            v-if="sector.path"
            :class="classNames(
              'st-roseChart__sector',
              `st-roseChart__sector--${sector.tone}`,
              isDim(i) ? 'st-roseChart__sector--dim' : undefined,
            )"
            :d="sector.path"
            :data-chart-index="i"
          />
        </template>
        <template v-for="sector in sectors" :key="`t${sector.datum.label}`">
          <text
            v-if="sector.showLabel"
            class="st-roseChart__label"
            :x="sector.labelX"
            :y="sector.labelY"
            text-anchor="middle"
            dominant-baseline="middle"
            :fill="contrastTextForTone(sector.tone)"
          >{{ sector.datum.label }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered && hovered.value > 0"
      class="st-roseChart__tooltip"
      role="presentation"
      :style="`left: ${(hovered.labelX / width) * 100}%; top: ${(hovered.labelY / height) * 100}%`"
    >
      <span class="st-roseChart__tooltipLabel">{{ hovered.datum.label }}</span>
      <span class="st-roseChart__tooltipValue">{{ formatNumber(hovered.value) }}</span>
    </div>
  </div>
</template>
