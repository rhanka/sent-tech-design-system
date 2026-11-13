<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type StatusHistoryTone =
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

export type StatusHistoryBucket = {
  at: number;
  value: string | number;
  tone?: StatusHistoryTone;
};

export type StatusHistorySeries = {
  series: string;
  buckets: StatusHistoryBucket[];
};

export type StatusHistoryChartProps = {
  data: StatusHistorySeries[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

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

defineOptions({ name: 'StatusHistoryChart', inheritAttrs: false });
const props = withDefaults(defineProps<StatusHistoryChartProps>(), {
  data: () => [], label: undefined, width: undefined, height: 320, size: undefined, class: undefined,
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

const height = computed(() => props.height ?? 320);
const resolvedWidth = computed(() => props.width ?? props.size ?? 640);
const label = computed(() => props.label);

const plotWidth = computed(() => Math.max(resolvedWidth.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

type ValidBucket = { at: number; value: string | number; tone?: StatusHistoryTone };
type ValidDatum = { series: string; buckets: ValidBucket[] };
const validData = computed<ValidDatum[]>(() =>
  (props.data ?? [])
    .filter((d) => typeof d.series === 'string' && d.series.length > 0)
    .map((d) => ({
      series: d.series,
      buckets: (d.buckets ?? [])
        .filter((b) => Number.isFinite(b.at))
        .map((b) => ({ at: b.at, value: b.value, tone: b.tone })),
    })),
);

const columnOrder = computed<number[]>(() => {
  const order: number[] = [];
  for (const d of validData.value) {
    for (const b of d.buckets) {
      if (!order.includes(b.at)) order.push(b.at);
    }
  }
  order.sort((a, b) => a - b);
  return order;
});

const statusOrder = computed<string[]>(() => {
  const order: string[] = [];
  for (const d of validData.value) {
    for (const b of d.buckets) {
      const key = String(b.value);
      if (!order.includes(key)) order.push(key);
    }
  }
  return order;
});
const explicitToneByStatus = computed(() => {
  const map = new Map<string, StatusHistoryTone>();
  for (const d of validData.value) {
    for (const b of d.buckets) {
      if (b.tone) map.set(String(b.value), b.tone);
    }
  }
  return map;
});

function toneOf(bucket: { value: string | number; tone?: StatusHistoryTone }): StatusHistoryTone {
  if (bucket.tone) return bucket.tone;
  const key = String(bucket.value);
  const explicit = explicitToneByStatus.value.get(key);
  if (explicit) return explicit;
  const idx = statusOrder.value.indexOf(key);
  return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as StatusHistoryTone;
}

const legendItems = computed(() => statusOrder.value.map((value) => ({ value, tone: toneOf({ value }) })));
const hasLegend = computed(() => statusOrder.value.length > 0);

type RowCell = {
  key: string;
  datum: ValidBucket;
  x: number;
  width: number;
  cx: number;
  tone: StatusHistoryTone;
};
type Row = {
  datum: ValidDatum;
  index: number;
  y: number;
  height: number;
  rowCenterY: number;
  cells: RowCell[];
};

const rows = computed<Row[]>(() => {
  if (validData.value.length === 0 || columnOrder.value.length === 0) return [];
  const band = plotHeight.value / validData.value.length;
  const rowHeight = Math.min(band * 0.62, 28);
  const colWidth = plotWidth.value / columnOrder.value.length;
  return validData.value.map((d, i) => {
    const y = MARGIN.top + band * i + (band - rowHeight) / 2;
    const cells = d.buckets.map((b, j) => {
      const colIndex = Math.max(0, columnOrder.value.indexOf(b.at));
      const x = MARGIN.left + colIndex * colWidth;
      const w = Math.max(colWidth - 2, 1);
      return { key: `${i}-${j}`, datum: b, x, width: w, cx: x + w / 2, tone: toneOf(b) };
    });
    return { datum: d, index: i, y, height: rowHeight, rowCenterY: MARGIN.top + band * (i + 0.5), cells };
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
    (d) => `${d.series}: ${d.buckets.map((b) => `${b.at} = ${b.value}`).join(', ')}`,
  ),
);

type Hovered = { row: Row; cell: RowCell } | null;
const hovered = computed<Hovered>(() => {
  if (hoveredKey.value === null) return null;
  for (const row of rows.value) {
    for (const cell of row.cells) {
      if (cell.key === hoveredKey.value) return { row, cell };
    }
  }
  return null;
});

function isDim(cell: RowCell): boolean {
  return hoveredKey.value !== null && hoveredKey.value !== cell.key;
}
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-statusHistoryChart', props.class)) }" >
    <div
      class="st-statusHistoryChart__visual"
      role="img"
      :aria-label="label"
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
          class="st-statusHistoryChart__tickLabel"
          :x="column.cx"
          :y="height - MARGIN.bottom + 16"
          text-anchor="middle"
        >{{ formatTick(column.at) }}</text>
        <line class="st-statusHistoryChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-statusHistoryChart__axis" :x1="MARGIN.left" :x2="resolvedWidth - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <template v-for="row in rows" :key="row.index">
          <text class="st-statusHistoryChart__seriesLabel" :x="MARGIN.left - 8" :y="row.rowCenterY" text-anchor="end" dominant-baseline="middle">{{ ellipsize(row.datum.series, 18) }}</text>
          <rect
            v-for="cell in row.cells"
            :key="`cell${cell.key}`"
            :class="classNames(
              'st-statusHistoryChart__cell',
              `st-statusHistoryChart__cell--${cell.tone}`,
              isDim(cell) ? 'st-statusHistoryChart__cell--dim' : undefined,
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
    <ul v-if="hasLegend" class="st-statusHistoryChart__legend" :aria-label="`Statuts de ${label ?? 'status history'}`">
      <li v-for="item in legendItems" :key="item.value" class="st-statusHistoryChart__legendItem">
        <span :class="`st-statusHistoryChart__legendSwatch st-statusHistoryChart__legendSwatch--${item.tone}`" aria-hidden="true" />{{ item.value }}
      </li>
    </ul>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label ?? 'status history'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-statusHistoryChart__tooltip"
      role="presentation"
      :style="`left:${(hovered.cell.cx / resolvedWidth) * 100}%;top:${(hovered.row.rowCenterY / height) * 100}%`"
    >
      <span class="st-statusHistoryChart__tooltipLabel">{{ `${hovered.row.datum.series} · ${hovered.cell.datum.at}` }}</span>
      <span class="st-statusHistoryChart__tooltipValue">{{ `${hovered.cell.datum.value}` }}</span>
    </div>
  </div>
</template>
