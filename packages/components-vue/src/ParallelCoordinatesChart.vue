<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type ParallelCoordinatesChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ParallelAxis = {
  key: string;
  label: string;
  min?: number;
  max?: number;
};

export type ParallelCoordinatesChartProps = {
  axes: ParallelAxis[];
  data: Record<string, unknown>[];
  label: string;
  // FIX: prop is `tones` (PLURAL) — consistency with other charts
  tones?: ParallelCoordinatesChartTone[];
  width?: number;
  height?: number;
  class?: string;
};

const TONES: ParallelCoordinatesChartTone[] = [
  'category1', 'category2', 'category3', 'category4',
  'category5', 'category6', 'category7', 'category8',
];

const MARGIN = { top: 32, right: 24, bottom: 16, left: 24 };

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// FIX: strict parse of a row value. Returns null if not finite → GAP in path.
function parseStrictFinite(raw: unknown): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw === 'string' && raw !== '') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Builds an SVG path with GAP (M...L... M...) for null points.
 */
function buildPathWithGaps(points: ({ x: number; y: number } | null)[]): string {
  const parts: string[] = [];
  let segment: { x: number; y: number }[] = [];

  for (const pt of points) {
    if (pt === null) {
      if (segment.length > 0) {
        parts.push(
          segment.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
        );
        segment = [];
      }
    } else {
      segment.push(pt);
    }
  }
  if (segment.length > 0) {
    parts.push(
      segment.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
    );
  }
  return parts.join(' ');
}

defineOptions({ name: 'ParallelCoordinatesChart', inheritAttrs: false });
const props = withDefaults(defineProps<ParallelCoordinatesChartProps>(), {
  axes: () => [], data: () => [], tones: undefined, width: 480, height: 300, class: undefined,
});

const hoveredIndex = ref<number | null>(null);

function handleLeave() {
  hoveredIndex.value = null;
}
function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) { hoveredIndex.value = null; return; }
  const idx = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(idx) ? idx : null;
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 300);
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

// Per-axis domains with strict parse
function axisDomain(axis: ParallelAxis): { min: number; max: number } {
  const data = props.data ?? [];
  const vals = data
    .map((d) => {
      const raw = d[axis.key];
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
      if (typeof raw === 'string' && raw !== '') {
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    })
    .filter((v): v is number => v !== null);

  const rawMin = vals.length > 0 ? Math.min(...vals) : 0;
  const rawMax = vals.length > 0 ? Math.max(...vals) : 1;
  const safeMax = rawMax === rawMin ? rawMin + 1 : rawMax;

  return {
    min: Number.isFinite(axis.min) ? (axis.min as number) : rawMin,
    max: Number.isFinite(axis.max) ? (axis.max as number) : safeMax,
  };
}

const axes = computed(() => props.axes ?? []);
const axisX = computed(() => axes.value.map(
  (_, i) =>
    MARGIN.left +
    (axes.value.length <= 1 ? plotWidth.value / 2 : (i / (axes.value.length - 1)) * plotWidth.value)
));

const lines = computed(() => {
  const data = props.data ?? [];
  const tonesArr = props.tones ?? [];
  return data.map((row, ri) => {
    const rowTone = tonesArr[ri] ?? TONES[ri % TONES.length];
    const points: ({ x: number; y: number } | null)[] = axes.value.map((axis, ai) => {
      const domain = axisDomain(axis);
      const val = parseStrictFinite(row[axis.key]);
      if (val === null) return null;
      const clamped = Math.min(Math.max(val, domain.min), domain.max);
      const t =
        domain.max === domain.min
          ? 0.5
          : (clamped - domain.min) / (domain.max - domain.min);
      return { x: axisX.value[ai], y: MARGIN.top + (1 - t) * plotHeight.value };
    });
    return { points, tone: rowTone, index: ri, row, path: buildPathWithGaps(points) };
  });
});

const dataValueItems = computed(() =>
  (props.data ?? []).map((row) =>
    axes.value.map((axis) => `${axis.label}: ${row[axis.key] ?? ''}`).join(', ')
  ),
);

const axisGeoms = computed(() => axes.value.map((axis, ai) => {
  const domain = axisDomain(axis);
  return { axis, domain, ax: axisX.value[ai] };
}));
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-parallelCoordinatesChart', props.class)) }" >
    <div
      class="st-parallelCoordinatesChart__visual"
      role="img"
      :aria-label="props.label"
      @pointermove="handlePointerMove"
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
        <path
          v-for="line in lines"
          :key="`line${line.index}`"
          :class="classNames('st-parallelCoordinatesChart__line', `st-parallelCoordinatesChart__line--${line.tone}`, hoveredIndex !== null && hoveredIndex !== line.index ? 'st-parallelCoordinatesChart__line--dim' : undefined, hoveredIndex === line.index ? 'st-parallelCoordinatesChart__line--active' : undefined)"
          :d="line.path"
          fill="none"
          :data-chart-index="line.index"
        />
        <template v-for="geom in axisGeoms" :key="`ax${geom.axis.key}`">
          <line class="st-parallelCoordinatesChart__axis" :x1="geom.ax" :x2="geom.ax" :y1="MARGIN.top" :y2="MARGIN.top + plotHeight" />
          <text class="st-parallelCoordinatesChart__axisLabel" :x="geom.ax" :y="MARGIN.top - 10" text-anchor="middle">{{ geom.axis.label }}</text>
          <text class="st-parallelCoordinatesChart__tickLabel" :x="geom.ax + 4" :y="MARGIN.top + plotHeight" dominant-baseline="auto">{{ formatTick(geom.domain.min) }}</text>
          <text class="st-parallelCoordinatesChart__tickLabel" :x="geom.ax + 4" :y="MARGIN.top" dominant-baseline="hanging">{{ formatTick(geom.domain.max) }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
  </div>
</template>
