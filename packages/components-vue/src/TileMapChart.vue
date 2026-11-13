<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type TileMapChartTile = {
  label: string;
  col: number;
  row: number;
  value: number;
};

export type TileMapChartProps = {
  data: TileMapChartTile[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 44, left: 16 } as const;
const TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;
const GAP = 4;

function toneForValue(value: number, min: number, max: number): (typeof TONES)[number] {
  if (!Number.isFinite(value) || max <= min) return 'category1';
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
  return TONES[index];
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, '');
}

defineOptions({ name: 'TileMapChart', inheritAttrs: false });
const props = withDefaults(defineProps<TileMapChartProps>(), {
  width: 480, height: 360, class: undefined,
});


const rootProps = computed(() => ({

  class: classNames('st-tileMapChart', props.class),
}));

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

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 360);
const valid = computed(() => (props.data ?? []).filter(
  tile => Number.isFinite(tile.col) && Number.isFinite(tile.row) && Number.isFinite(tile.value),
));
const tiles = computed(() => {
  const data = valid.value;
  if (data.length === 0) return [];
  const w = width.value;
  const h = height.value;
  const plotWidth = Math.max(w - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(h - MARGIN.top - MARGIN.bottom, 1);
  const cols = Math.max(...data.map(t => t.col)) + 1;
  const rows = Math.max(...data.map(t => t.row)) + 1;
  const values = data.map(t => t.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const side = Math.max(Math.min(plotWidth / cols, plotHeight / rows) - GAP, 1);
  const gridW = cols * (side + GAP) - GAP;
  const gridH = rows * (side + GAP) - GAP;
  const offsetX = MARGIN.left + Math.max((plotWidth - gridW) / 2, 0);
  const offsetY = MARGIN.top + Math.max((plotHeight - gridH) / 2, 0);
  return data.map((tile, index) => {
    const x = offsetX + tile.col * (side + GAP);
    const y = offsetY + tile.row * (side + GAP);
    return {
      tile,
      index,
      tone: toneForValue(tile.value, min, max),
      x,
      y,
      side,
      cx: x + side / 2,
      cy: y + side / 2,
    };
  });
});
const dataValueItems = computed(() => valid.value.map(tile => `${tile.label}: ${formatNumber(tile.value)}`));
const hovered = computed(() => hoveredIndex.value !== null ? tiles.value[hoveredIndex.value] : undefined);

function tileClass(tile: { tone: string }, index: number) {
  const isDim = hoveredIndex.value !== null && hoveredIndex.value !== index;
  return classNames(
    'st-tileMapChart__tile',
    `st-tileMapChart__tile--${tile.tone}`,
    isDim ? 'st-tileMapChart__tile--dim' : undefined,
  );
}
</script>

<template>
  <div v-bind="{ ...$attrs, ...rootProps }">
    <div class="st-tileMapChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <g v-for="tile in tiles" :key="`${tile.tile.label}-${tile.index}`">
          <rect :class="tileClass(tile, tile.index)" :x="tile.x" :y="tile.y" :width="tile.side" :height="tile.side" rx="3" :data-chart-index="tile.index" />
          <text v-if="tile.side > 18" class="st-tileMapChart__tileLabel" :x="tile.cx" :y="tile.cy" text-anchor="middle" dominant-baseline="middle" pointer-events="none">{{ tile.tile.label }}</text>
        </g>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-tileMapChart__tooltip" role="presentation" :style="`left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`">
      <span class="st-tileMapChart__tooltipLabel">{{ hovered.tile.label }}</span>
      <span class="st-tileMapChart__tooltipValue">{{ formatNumber(hovered.tile.value) }}</span>
    </div>
    <div class="st-tileMapChart__legend" aria-hidden="true">
      <span class="st-tileMapChart__legendText">Low</span>
      <span class="st-tileMapChart__legendRamp">
        <span v-for="tone in TONES" :key="tone" :class="`st-tileMapChart__legendSwatch st-tileMapChart__legendSwatch--${tone}`" />
      </span>
      <span class="st-tileMapChart__legendText">High</span>
    </div>
  </div>
</template>
