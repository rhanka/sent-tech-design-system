<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type AnomalySwimLaneTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type AnomalySwimLaneChartScale = 'categorical' | 'sequential';

export type AnomalySwimLaneBucket = {
  at: number;
  score: number;
};

export type AnomalySwimLaneSeries = {
  job: string;
  buckets: AnomalySwimLaneBucket[];
};

export type AnomalySwimLaneChartProps = {
  data: AnomalySwimLaneSeries[];
  max?: number;
  scale?: AnomalySwimLaneChartScale;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 28, right: 18, bottom: 44, left: 132 };
const TONES: AnomalySwimLaneTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

function normalizedScale(value: AnomalySwimLaneChartScale | undefined): AnomalySwimLaneChartScale {
  return value === 'categorical' ? 'categorical' : 'sequential';
}

// Continuous scale: score intensity normalised 0..max → category1..8 (shared
// with HeatmapChart). max ≤ 0 or non-finite score → category1 (floor intensity).
function toneForScore(score: number, scoreMax: number): AnomalySwimLaneTone {
  if (!Number.isFinite(score) || scoreMax <= 0) return 'category1';
  const ratio = Math.max(0, Math.min(1, score / scoreMax));
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(ratio * TONES.length)));
  return TONES[index];
}

// Truncate a label to the left margin width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return '…';
  return `${text.slice(0, maxChars - 1)}…`;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

type RowCell = {
  key: string;
  datum: AnomalySwimLaneBucket;
  x: number;
  width: number;
  cx: number;
  tone: AnomalySwimLaneTone;
};
type Row = {
  datum: { job: string; buckets: AnomalySwimLaneBucket[] };
  index: number;
  y: number;
  height: number;
  rowCenterY: number;
  cells: RowCell[];
};

defineOptions({ name: 'AnomalySwimLaneChart', inheritAttrs: false });
const props = withDefaults(defineProps<AnomalySwimLaneChartProps>(), {
  data: () => [],
  max: undefined,
  scale: 'sequential',
  label: undefined,
  width: undefined,
  height: 300,
  size: undefined,
  class: undefined,
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

const height = computed(() => props.height ?? 300);
const resolvedWidth = computed(() => props.width ?? props.size ?? 520);
const resolvedScale = computed(() => normalizedScale(props.scale));
const plotWidth = computed(() => Math.max(resolvedWidth.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

const validData = computed(() =>
  (props.data ?? [])
    .filter((d) => typeof d.job === 'string' && d.job.length > 0)
    .map((d) => ({
      job: d.job,
      buckets: (d.buckets ?? [])
        .filter((b) => Number.isFinite(b.at))
        .map((b) => ({ at: b.at, score: b.score })),
    })),
);

const columnOrder = computed(() => {
  const order: number[] = [];
  for (const d of validData.value) {
    for (const b of d.buckets) {
      if (!order.includes(b.at)) order.push(b.at);
    }
  }
  order.sort((a, b) => a - b);
  return order;
});

const scoreMax = computed(() => {
  if (typeof props.max === 'number' && Number.isFinite(props.max) && props.max > 0) return props.max;
  const scores = validData.value
    .flatMap((d) => d.buckets.map((b) => b.score))
    .filter(Number.isFinite);
  return scores.length > 0 ? Math.max(...scores) : 1;
});

const rows = computed((): Row[] => {
  if (validData.value.length === 0 || columnOrder.value.length === 0) return [];
  const band = plotHeight.value / validData.value.length;
  const rowHeight = Math.min(band * 0.78, 34);
  const colWidth = plotWidth.value / columnOrder.value.length;
  return validData.value.map((d, i) => {
    const y = MARGIN.top + band * i + (band - rowHeight) / 2;
    const cells = d.buckets.map((b, j) => {
      const colIndex = Math.max(0, columnOrder.value.indexOf(b.at));
      const x = MARGIN.left + colIndex * colWidth;
      const w = Math.max(colWidth - 2, 1);
      return {
        key: `${i}-${j}`,
        datum: b,
        x,
        width: w,
        cx: x + w / 2,
        tone: toneForScore(b.score, scoreMax.value),
      };
    });
    return {
      datum: d,
      index: i,
      y,
      height: rowHeight,
      rowCenterY: MARGIN.top + band * (i + 0.5),
      cells,
    };
  });
});

const columns = computed(() =>
  columnOrder.value.length === 0
    ? []
    : columnOrder.value.map((at, index) => ({
        at,
        cx: MARGIN.left + (index + 0.5) * (plotWidth.value / columnOrder.value.length),
      })),
);

const dataValueItems = computed(() =>
  validData.value.map(
    (d) => `${d.job}: ${d.buckets.map((b) => `${b.at} = ${b.score}`).join(', ')}`,
  ),
);

const legendItems = TONES.map((tone) => ({ tone }));
const hasLegend = computed(() => validData.value.length > 0 && columnOrder.value.length > 0);

const hovered = computed(() => {
  if (hoveredKey.value === null) return null;
  for (const row of rows.value) {
    for (const cell of row.cells) {
      if (cell.key === hoveredKey.value) return { row, cell };
    }
  }
  return null;
});
</script>

<template>
  <div
    v-bind="$attrs"
    :class="classNames('st-anomalySwimLaneChart', `st-anomalySwimLaneChart--${resolvedScale}`, props.class)"
  >
    <div
      class="st-anomalySwimLaneChart__visual"
      role="img"
      :aria-label="props.label"
      @pointermove="handlePointerMove"
      @pointerleave="handleLeave"
    >
      <svg
        :viewBox="`0 0 ${resolvedWidth} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <text
          v-for="column in columns"
          :key="`t${column.at}`"
          class="st-anomalySwimLaneChart__tickLabel"
          :x="column.cx"
          :y="height - MARGIN.bottom + 16"
          text-anchor="middle"
        >{{ formatTick(column.at) }}</text>
        <line class="st-anomalySwimLaneChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-anomalySwimLaneChart__axis" :x1="MARGIN.left" :x2="resolvedWidth - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <template v-for="row in rows" :key="`row${row.index}`">
          <text
            class="st-anomalySwimLaneChart__jobLabel"
            :x="MARGIN.left - 8"
            :y="row.rowCenterY"
            text-anchor="end"
            dominant-baseline="middle"
          >{{ ellipsize(row.datum.job, 18) }}</text>
          <rect
            v-for="cell in row.cells"
            :key="`cell${cell.key}`"
            :class="classNames(
              'st-anomalySwimLaneChart__cell',
              `st-anomalySwimLaneChart__cell--${cell.tone}`,
              hoveredKey !== null && hoveredKey !== cell.key ? 'st-anomalySwimLaneChart__cell--dim' : undefined,
            )"
            :x="cell.x"
            :y="row.y"
            :width="cell.width"
            :height="row.height"
            rx="2"
            :data-chart-key="cell.key"
          />
        </template>
      </svg>
    </div>
    <div v-if="hasLegend" class="st-anomalySwimLaneChart__legend" aria-hidden="true">
      <span class="st-anomalySwimLaneChart__legendText">Low</span>
      <span class="st-anomalySwimLaneChart__legendRamp">
        <span
          v-for="item in legendItems"
          :key="item.tone"
          :class="`st-anomalySwimLaneChart__legendSwatch st-anomalySwimLaneChart__legendSwatch--${item.tone}`"
        />
      </span>
      <span class="st-anomalySwimLaneChart__legendText">High</span>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label ?? 'anomaly swim lane'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-anomalySwimLaneChart__tooltip"
      role="presentation"
      :style="`left:${(hovered.cell.cx / resolvedWidth) * 100}%;top:${(hovered.row.rowCenterY / height) * 100}%`"
    >
      <span class="st-anomalySwimLaneChart__tooltipLabel">{{ `${hovered.row.datum.job} · ${hovered.cell.datum.at}` }}</span>
      <span class="st-anomalySwimLaneChart__tooltipValue">{{ `${hovered.cell.datum.score}` }}</span>
    </div>
  </div>
</template>
