<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { classNames } from './classNames.js';

export type DashboardGridTile = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  description?: string;
  value?: string;
};

export type DashboardGridProps = {
  tiles: DashboardGridTile[];
  columns?: number;
  rowHeight?: number;
  gap?: number;
  editable?: boolean;
  label?: string;
  onLayout?: (tiles: DashboardGridTile[]) => void;
  class?: string;
};

function safeColumns(value: number | undefined): number {
  return Math.max(1, Math.floor(value || 12));
}

function cloneTile(tile: DashboardGridTile): DashboardGridTile {
  return { ...tile };
}

function normalizeTile(tile: DashboardGridTile, columns: number): DashboardGridTile {
  const w = Math.max(1, Math.min(columns, Math.floor(tile.w || 1)));
  const x = Math.max(0, Math.min(columns - w, Math.floor(tile.x || 0)));
  return {
    ...tile,
    id: String(tile.id),
    x,
    y: Math.max(0, Math.floor(tile.y || 0)),
    w,
    h: Math.max(1, Math.floor(tile.h || 1)),
  };
}

function normalizeTiles(tiles: DashboardGridTile[], columns: number): DashboardGridTile[] {
  return tiles.map((tile) => normalizeTile(cloneTile(tile), columns));
}

defineOptions({ name: 'DashboardGrid', inheritAttrs: false });
const props = withDefaults(defineProps<DashboardGridProps>(), {
  columns: 12,
  rowHeight: 88,
  gap: 16,
  editable: false,
  label: 'Dashboard grid',
  onLayout: undefined,
  class: undefined,
});
const emit = defineEmits<{ layout: [tiles: DashboardGridTile[]] }>();

const layout = ref<DashboardGridTile[]>(normalizeTiles(props.tiles ?? [], safeColumns(props.columns)));

watch(
  () => JSON.stringify({ tiles: props.tiles, columns: safeColumns(props.columns) }),
  () => {
    layout.value = normalizeTiles(props.tiles ?? [], safeColumns(props.columns));
  },
);

function commit(nextTiles: DashboardGridTile[]) {
  const normalized = normalizeTiles(nextTiles, safeColumns(props.columns));
  layout.value = normalized;

  emit('layout', normalized.map(cloneTile));
}

function changeTile(id: string, patch: Partial<DashboardGridTile>) {
  commit(layout.value.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)));
}

function moveTile(id: string, dx: number, dy: number) {
  const tile = layout.value.find((candidate) => candidate.id === id);
  if (!tile) return;
  changeTile(id, { x: tile.x + dx, y: tile.y + dy });
}

function resizeTile(id: string, dw: number, dh: number) {
  const tile = layout.value.find((candidate) => candidate.id === id);
  if (!tile) return;
  changeTile(id, { w: tile.w + dw, h: tile.h + dh });
}

const colCount = computed(() => safeColumns(props.columns));
const gridStyle = computed<Record<string, string>>(() => ({
  '--st-dashboardGrid-columns': String(colCount.value),
  '--st-dashboardGrid-row-height': `${Math.max(32, Math.floor(props.rowHeight || 88))}px`,
  '--st-dashboardGrid-gap': `${Math.max(0, Math.floor(props.gap || 0))}px`,
}));
</script>

<template>
  <section  v-bind="{ ...$attrs, style: [gridStyle, $attrs.style], class: classNames('st-dashboardGrid', props.editable ? 'st-dashboardGrid--editable' : undefined, props.class) }" :aria-label="props.label ?? 'Dashboard grid'">
    <article v-for="tile in layout" :key="tile.id" class="st-dashboardGrid__tile" :style="`grid-column: ${tile.x + 1} / span ${tile.w}; grid-row: ${tile.y + 1} / span ${tile.h};`">
      <div class="st-dashboardGrid__content">
        <h3 v-if="tile.title" class="st-dashboardGrid__title">{{ tile.title }}</h3>
        <p v-if="tile.value" class="st-dashboardGrid__value">{{ tile.value }}</p>
        <p v-if="tile.description" class="st-dashboardGrid__description">{{ tile.description }}</p>
      </div>
      <div v-if="props.editable" class="st-dashboardGrid__controls" :aria-label="`Layout controls for ${tile.title ?? tile.id}`">
        <button type="button" :aria-label="`Move ${tile.title ?? tile.id} up`" @click="moveTile(tile.id, 0, -1)">↑</button>
        <button type="button" :aria-label="`Move ${tile.title ?? tile.id} left`" @click="moveTile(tile.id, -1, 0)">←</button>
        <button type="button" :aria-label="`Move ${tile.title ?? tile.id} right`" @click="moveTile(tile.id, 1, 0)">→</button>
        <button type="button" :aria-label="`Move ${tile.title ?? tile.id} down`" @click="moveTile(tile.id, 0, 1)">↓</button>
        <button type="button" :aria-label="`Widen ${tile.title ?? tile.id}`" @click="resizeTile(tile.id, 1, 0)">W+</button>
        <button type="button" :aria-label="`Narrow ${tile.title ?? tile.id}`" @click="resizeTile(tile.id, -1, 0)">W-</button>
        <button type="button" :aria-label="`Taller ${tile.title ?? tile.id}`" @click="resizeTile(tile.id, 0, 1)">H+</button>
        <button type="button" :aria-label="`Shorter ${tile.title ?? tile.id}`" @click="resizeTile(tile.id, 0, -1)">H-</button>
      </div>
    </article>
  </section>
</template>
