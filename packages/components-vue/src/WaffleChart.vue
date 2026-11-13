<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type WaffleTone =
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

export type WaffleChartDatum = {
  label: string;
  value: number;
  tone?: WaffleTone;
};

export type WaffleChartProps = {
  data: WaffleChartDatum[];
  totalCells?: number;
  columns?: number;
  label?: string;
  size?: number;
  class?: string;
};

const GAP = 2;

defineOptions({ name: 'WaffleChart', inheritAttrs: false });
const props = withDefaults(defineProps<WaffleChartProps>(), {
  totalCells: 100, columns: 10, label: undefined, size: 240, class: undefined,
});


const rootProps = computed(() => ({

  class: classNames('st-waffleChart', props.class),
}));

const size = computed(() => props.size ?? 240);
const safeTotalCells = computed(() => Math.max(Math.round(props.totalCells ?? 100), 1));
const safeColumns = computed(() => Math.max(Math.round(props.columns ?? 10), 1));
const rowsCount = computed(() => Math.ceil(safeTotalCells.value / safeColumns.value));

// Normalise: drop unlabeled categories and non-finite/≤0 values.
const validData = computed(() => (props.data ?? []).filter(
  (d) => typeof d.label === 'string' && d.label.length > 0 && Number.isFinite(d.value) && d.value > 0,
));

const total = computed(() => validData.value.reduce((sum, d) => sum + d.value, 0));

function toneOf(datum: WaffleChartDatum, index: number): WaffleTone {
  return datum.tone ?? (`category${(index % 8) + 1}` as WaffleTone);
}

// Allocate safeTotalCells cells: each category occupies
// round(value / total * safeTotalCells) consecutive cells.
const allocation = computed(() => {
  const alloc: { datum: WaffleChartDatum; tone: WaffleTone; cells: number; index: number }[] = [];
  if (total.value > 0) {
    let used = 0;
    for (let index = 0; index < validData.value.length; index++) {
      const datum = validData.value[index];
      const cells = Math.round((datum.value / total.value) * safeTotalCells.value);
      alloc.push({ datum, tone: toneOf(datum, index), cells, index });
      used += cells;
    }
    const overflow = used - safeTotalCells.value;
    if (overflow !== 0 && alloc.length > 0) {
      const last = alloc[alloc.length - 1];
      last.cells = Math.max(0, last.cells - overflow);
    }
  }
  return alloc;
});

// Flatten into a per-cell tone sequence (neutral track beyond the data).
const cellTones = computed(() => {
  const tones: (WaffleTone | null)[] = [];
  for (const a of allocation.value) {
    for (let i = 0; i < a.cells && tones.length < safeTotalCells.value; i++) {
      tones.push(a.tone);
    }
  }
  while (tones.length < safeTotalCells.value) tones.push(null);
  return tones;
});

const cellSize = computed(() => (size.value - GAP * (safeColumns.value - 1)) / safeColumns.value);
const cells = computed(() => cellTones.value.map((tone, index) => {
  const col = index % safeColumns.value;
  const rowFromTop = rowsCount.value - 1 - Math.floor(index / safeColumns.value);
  return {
    index,
    tone,
    x: col * (cellSize.value + GAP),
    y: rowFromTop * (cellSize.value + GAP),
    size: Math.max(cellSize.value, 1),
  };
}));

const svgHeight = computed(() => rowsCount.value > 0 ? rowsCount.value * cellSize.value + GAP * (rowsCount.value - 1) : size.value);

const legendItems = computed(() => allocation.value.map((a) => ({
  label: a.datum.label,
  tone: a.tone,
  percent: total.value > 0 ? Math.round((a.datum.value / total.value) * 100) : 0,
})));
const hasLegend = computed(() => allocation.value.length > 0);

const dataValueItems = computed(() => allocation.value.map(
  (a) => `${a.datum.label}: ${a.datum.value} (${total.value > 0 ? Math.round((a.datum.value / total.value) * 100) : 0}%)`,
));
</script>

<template>
  <div v-bind="{ ...$attrs, ...rootProps }">
    <div class="st-waffleChart__visual" role="img" :aria-label="props.label">
      <svg :viewBox="`0 0 ${size} ${svgHeight}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <rect v-for="cell in cells" :key="cell.index" :class="cell.tone ? `st-waffleChart__cell st-waffleChart__cell--${cell.tone}` : 'st-waffleChart__cell st-waffleChart__cell--track'" :x="cell.x" :y="cell.y" :width="cell.size" :height="cell.size" rx="2" />
      </svg>
    </div>
    <ul v-if="hasLegend" class="st-waffleChart__legend" :aria-label="`Catégories de ${props.label ?? 'waffle'}`">
      <li v-for="item in legendItems" :key="item.label" class="st-waffleChart__legendItem"><span :class="`st-waffleChart__legendSwatch st-waffleChart__legendSwatch--${item.tone}`" aria-hidden="true" />{{ `${item.label} · ${item.percent}%` }}</li>
    </ul>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label ?? 'waffle'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
  </div>
</template>
