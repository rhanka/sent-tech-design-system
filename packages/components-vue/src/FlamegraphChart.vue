<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type FlamegraphNode = {
  name: string;
  value: number;
  children?: FlamegraphNode[];
};

export type FlamegraphChartProps = {
  data: FlamegraphNode;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const ROW_H = 26;
const ROW_GAP = 2;

const toneForDepth = (depth: number): string => `category${(depth % 8) + 1}`;

// Truncate a label to the rectangle width (approx. by char count).
const ellipsize = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return '…';
  return `${text.slice(0, maxChars - 1)}…`;
};

const charsFor = (w: number): number => Math.max(0, Math.floor((w - 8) / 6.6));

type Cell = {
  key: string;
  name: string;
  value: number;
  depth: number;
  x: number;
  y: number;
  width: number;
  tone: string;
  cx: number;
  cy: number;
};

defineOptions({ name: 'FlamegraphChart', inheritAttrs: false });
const props = withDefaults(defineProps<FlamegraphChartProps>(), {
  label: undefined,
  width: undefined,
  height: 320,
  size: undefined,
  class: undefined,
});

const hoveredKey = ref<string | null>(null);

const handleLeave = () => {
  hoveredKey.value = null;
};

const handlePointerMove = (event: PointerEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredKey.value = null;
    return;
  }
  hoveredKey.value = target.getAttribute('data-chart-key');
};

const label = computed(() => props.label ? props.label : 'flamegraph');
const height = computed(() => props.height ?? 320);
const resolvedWidth = computed(() => props.width ?? props.size ?? 640);

const plotWidth = computed(() => Math.max(resolvedWidth.value - MARGIN.left - MARGIN.right, 1));

// Recursive icicle layout: the root spans `plotWidth`; each child occupies
// a `value/sum(siblings)` fraction of its parent's width.
const cells = computed<Cell[]>(() => {
  const data = props.data;
  const result: Cell[] = [];
  if (data && typeof data.name === 'string' && Number.isFinite(data.value)) {
    const walk = (node: FlamegraphNode, depth: number, x0: number, w: number, path: string) => {
      if (w <= 0) return;
      const y = MARGIN.top + depth * (ROW_H + ROW_GAP);
      result.push({
        key: path,
        name: node.name,
        value: node.value,
        depth,
        x: x0,
        y,
        width: w,
        tone: toneForDepth(depth),
        cx: x0 + w / 2,
        cy: y + ROW_H / 2,
      });
      const kids = (node.children ?? []).filter(
        (c) => c && typeof c.name === 'string' && Number.isFinite(c.value) && c.value > 0,
      );
      if (kids.length === 0) return;
      const total = kids.reduce((s, c) => s + Math.max(c.value, 0), 0);
      if (total <= 0) return;
      let cursor = x0;
      kids.forEach((child, ci) => {
        const cw = (Math.max(child.value, 0) / total) * w;
        walk(child, depth + 1, cursor, cw, `${path}.${ci}`);
        cursor += cw;
      });
    };
    walk(data, 0, MARGIN.left, plotWidth.value, '0');
  }
  return result;
});

const maxDepth = computed(() => cells.value.reduce((m, c) => Math.max(m, c.depth), 0));
const computedHeight = computed(() =>
  cells.value.length === 0
    ? height.value
    : Math.max(
        height.value,
        MARGIN.top + (maxDepth.value + 1) * (ROW_H + ROW_GAP) - ROW_GAP + MARGIN.bottom,
      ),
);

const dataValueItems = computed(() => cells.value.map((c) => `${'·'.repeat(c.depth)}${c.name}: ${c.value}`));

const hoveredCell = computed(() =>
  hoveredKey.value !== null ? cells.value.find((c) => c.key === hoveredKey.value) ?? null : null,
);

const isCellDim = (cell: Cell): boolean => hoveredKey.value !== null && hoveredKey.value !== cell.key;
const cellChars = (cell: Cell): number => charsFor(cell.width);
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-flamegraphChart', props.class)) }" >
    <div class="st-flamegraphChart__visual" role="img" :aria-label="props.label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${resolvedWidth} ${computedHeight}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <g v-for="cell in cells" :key="cell.key" class="st-flamegraphChart__node">
          <rect :class="classNames('st-flamegraphChart__frame', `st-flamegraphChart__frame--${cell.tone}`, isCellDim(cell) ? 'st-flamegraphChart__frame--dim' : undefined)" :x="cell.x" :y="cell.y" :width="Math.max(cell.width, 1)" :height="ROW_H" rx="2" :data-chart-key="cell.key"></rect>
          <text v-if="cellChars(cell) >= 2" class="st-flamegraphChart__label" :x="cell.x + 4" :y="cell.y + ROW_H / 2" dominant-baseline="central">{{ ellipsize(cell.name, cellChars(cell)) }}</text>
        </g>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredCell" class="st-flamegraphChart__tooltip" role="presentation" :style="`left:${(hoveredCell.cx / resolvedWidth) * 100}%;top:${(hoveredCell.cy / computedHeight) * 100}%`">
      <span class="st-flamegraphChart__tooltipLabel">{{ hoveredCell.name }}</span>
      <span class="st-flamegraphChart__tooltipValue">{{ `${hoveredCell.value}` }}</span>
    </div>
  </div>
</template>
