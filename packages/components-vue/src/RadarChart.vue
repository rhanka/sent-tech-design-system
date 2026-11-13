<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type RadarChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type RadarChartSeries = {
  label: string;
  values: number[];
  tone?: RadarChartTone;
};

export type RadarChartProps = {
  axes: string[];
  series: RadarChartSeries[];
  maxValue?: number;
  levels?: number;
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

const TONES: RadarChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

function pointAt(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

defineOptions({ name: 'RadarChart', inheritAttrs: false });
const props = withDefaults(defineProps<RadarChartProps>(), {
  maxValue: undefined, levels: 4, width: 360, height: 320, legend: false, class: undefined,
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

const width = computed(() => props.width ?? 360);
const height = computed(() => props.height ?? 320);
const legend = computed(() => props.legend ?? false);
const label = computed(() => props.label);
const axesList = computed(() => props.axes ?? []);
const seriesList = computed(() => props.series ?? []);
const safeLevelCount = computed(() => Math.max(1, Math.floor(props.levels ?? 4)));

const centerX = computed(() => width.value / 2);
const centerY = computed(() => height.value / 2);
const radius = computed(() => Math.max(Math.min(width.value, height.value) / 2 - 42, 1));
const domainMax = computed(() => {
  const allValues = seriesList.value.flatMap((item) => item.values).filter(Number.isFinite);
  return Number.isFinite(props.maxValue) && (props.maxValue ?? 0) > 0
    ? (props.maxValue as number)
    : Math.max(1, ...allValues);
});

type AxisEntry = { axis: string; x: number; y: number; labelX: number; labelY: number; angle: number };
const axisEntries = computed<AxisEntry[]>(() =>
  axesList.value.map((axis, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / Math.max(axesList.value.length, 1);
    const [x, y] = pointAt(centerX.value, centerY.value, radius.value, angle);
    const [labelX, labelY] = pointAt(centerX.value, centerY.value, radius.value + 22, angle);
    return { axis, x, y, labelX, labelY, angle };
  }),
);

type PolygonGeom = {
  item: RadarChartSeries;
  tone: RadarChartTone;
  points: { x: number; y: number }[];
  pointString: string;
};
const polygons = computed<PolygonGeom[]>(() =>
  seriesList.value.map((item, seriesIndex) => {
    const tone = item.tone ?? TONES[seriesIndex % TONES.length];
    const pts = axesList.value.map((_, axisIndex) => {
      const value = Math.max(0, item.values[axisIndex] ?? 0);
      const scaled = Math.min(value / domainMax.value, 1) * radius.value;
      const angle = -Math.PI / 2 + (Math.PI * 2 * axisIndex) / Math.max(axesList.value.length, 1);
      const [x, y] = pointAt(centerX.value, centerY.value, scaled, angle);
      return { x, y };
    });
    return { item, tone, points: pts, pointString: pts.map((p) => `${p.x},${p.y}`).join(' ') };
  }),
);

const rings = computed(() =>
  Array.from({ length: safeLevelCount.value }, (_, ringIndex) => {
    const ringRadius = (radius.value * (ringIndex + 1)) / safeLevelCount.value;
    const ringPoints = axisEntries.value.map((a) => pointAt(centerX.value, centerY.value, ringRadius, a.angle)).map(([x, y]) => `${x},${y}`).join(' ');
    return { key: `ring${ringIndex}`, points: ringPoints };
  }),
);

const dataValueItems = computed(() =>
  seriesList.value.flatMap((item) =>
    axesList.value.map((axis, i) => `${item.label}, ${axis}: ${item.values[i] ?? 0}`),
  ),
);

const hovered = computed(() =>
  hoveredIndex.value !== null ? polygons.value[hoveredIndex.value] : undefined,
);

function isDim(i: number): boolean {
  return hoveredIndex.value !== null && hoveredIndex.value !== i;
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-radarChart', props.class)">
    <div
      class="st-radarChart__visual"
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
        <polygon
          v-for="ring in rings"
          :key="ring.key"
          class="st-radarChart__ring"
          :points="ring.points"
        />
        <template v-for="entry in axisEntries" :key="entry.axis">
          <line class="st-radarChart__axis" :x1="centerX" :x2="entry.x" :y1="centerY" :y2="entry.y" />
          <text
            class="st-radarChart__axisLabel"
            :x="entry.labelX"
            :y="entry.labelY"
            text-anchor="middle"
            dominant-baseline="middle"
          >{{ entry.axis }}</text>
        </template>
        <template v-for="(polygon, i) in polygons" :key="polygon.item.label">
          <polygon
            :class="classNames(
              'st-radarChart__polygon',
              `st-radarChart__polygon--${polygon.tone}`,
              isDim(i) ? 'st-radarChart__polygon--dim' : undefined,
            )"
            :points="polygon.pointString"
            :data-chart-index="i"
          />
          <circle
            v-for="(point, pointIndex) in polygon.points"
            :key="`${polygon.item.label}-p${pointIndex}`"
            :class="classNames('st-radarChart__point', `st-radarChart__point--${polygon.tone}`)"
            :cx="point.x"
            :cy="point.y"
            r="3"
            :data-chart-index="i"
          />
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-radarChart__tooltip" role="presentation">
      <span class="st-radarChart__tooltipLabel">{{ hovered.item.label }}</span>
    </div>
    <ul v-if="legend" class="st-radarChart__legend" aria-hidden="true">
      <li v-for="polygon in polygons" :key="polygon.item.label" class="st-radarChart__legendItem">
        <span :class="`st-radarChart__legendSwatch st-radarChart__legendSwatch--${polygon.tone}`" aria-hidden="true" />{{ ` ${polygon.item.label}` }}
      </li>
    </ul>
  </div>
</template>
