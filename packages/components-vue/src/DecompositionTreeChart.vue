<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type DecompositionTreeNode = {
  label: string;
  value: number;
  parent?: string;
};

export type DecompositionTreeLevel = {
  dimension: string;
  nodes: DecompositionTreeNode[];
};

export type DecompositionTreeData = {
  measure: string;
  levels: DecompositionTreeLevel[];
};

export type DecompositionTreeChartProps = {
  data: DecompositionTreeData;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const BAR_H = 22;
const BAR_GAP = 10;
const COL_GAP = 36;
const BAR_W = 110;

const toneForLevel = (level: number): string => `category${(level % 8) + 1}`;

// Truncate a label to the bar width (approx. by char count).
const ellipsize = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return '…';
  return `${text.slice(0, maxChars - 1)}…`;
};

const formatValue = (v: number): string => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
};

const charsFor = (w: number): number => Math.max(0, Math.floor((w - 8) / 6.6));

type Cell = {
  key: string;
  label: string;
  dimension: string;
  value: number;
  level: number;
  x: number;
  y: number;
  barWidth: number;
  tone: string;
  cx: number;
  cy: number;
  parentKey: string | null;
};

type Link = {
  key: string;
  from: Cell;
  to: Cell;
};

const linkPath = (link: Link): string => {
  const x1 = link.from.x + link.from.barWidth;
  const y1 = link.from.cy;
  const x2 = link.to.x;
  const y2 = link.to.cy;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
};

defineOptions({ name: 'DecompositionTreeChart', inheritAttrs: false });
const props = withDefaults(defineProps<DecompositionTreeChartProps>(), {
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

const label = computed(() => props.label);
const height = computed(() => props.height ?? 320);
const resolvedWidth = computed(() => props.width ?? props.size ?? 640);

const colX = (level: number): number => MARGIN.left + level * (BAR_W + COL_GAP);

// Build the columns: root (column 0 = total measure), then one column per
// level; a bar width is ∝ value relative to its level max.
const built = computed(() => {
  const data = props.data;
  const cells: Cell[] = [];
  const links: Link[] = [];
  if (data && typeof data.measure === 'string') {
    const plotTop = MARGIN.top;
    const levels = (data.levels ?? []).filter(
      (lvl) => lvl && typeof lvl.dimension === 'string',
    );
    const firstLevelTotal = levels[0]
      ? levels[0].nodes
          .filter((n) => n && Number.isFinite(n.value))
          .reduce((s, n) => s + Math.max(n.value, 0), 0)
      : 0;
    const rootValue = firstLevelTotal > 0 ? firstLevelTotal : 1;

    const rootCell: Cell = {
      key: 'root',
      label: data.measure,
      dimension: data.measure,
      value: rootValue,
      level: 0,
      x: colX(0),
      y: plotTop,
      barWidth: BAR_W,
      tone: toneForLevel(0),
      cx: colX(0) + BAR_W / 2,
      cy: plotTop + BAR_H / 2,
      parentKey: null,
    };
    cells.push(rootCell);

    let prevColumn: Cell[] = [rootCell];
    levels.forEach((lvl, li) => {
      const level = li + 1;
      const nodes = (lvl.nodes ?? []).filter(
        (n) => n && typeof n.label === 'string' && Number.isFinite(n.value),
      );
      const levelMax = nodes.reduce((m, n) => Math.max(m, Math.max(n.value, 0)), 0) || 1;
      const x = colX(level);
      const column: Cell[] = [];
      nodes.forEach((n, ni) => {
        const y = plotTop + ni * (BAR_H + BAR_GAP);
        const barWidth = Math.max((Math.max(n.value, 0) / levelMax) * BAR_W, 2);
        const parentCell =
          (n.parent !== undefined && prevColumn.find((p) => p.label === n.parent)) ||
          prevColumn[0] ||
          null;
        const cell: Cell = {
          key: `${level}-${ni}`,
          label: n.label,
          dimension: lvl.dimension,
          value: n.value,
          level,
          x,
          y,
          barWidth,
          tone: toneForLevel(level),
          cx: x + barWidth / 2,
          cy: y + BAR_H / 2,
          parentKey: parentCell ? parentCell.key : null,
        };
        cells.push(cell);
        column.push(cell);
        if (parentCell) {
          links.push({ key: `${parentCell.key}>${cell.key}`, from: parentCell, to: cell });
        }
      });
      if (column.length > 0) prevColumn = column;
    });
  }
  return { cells, links };
});
const cells = computed(() => built.value.cells);
const links = computed(() => built.value.links);

const computedHeight = computed(() =>
  cells.value.length === 0
    ? height.value
    : Math.max(
        height.value,
        cells.value.reduce((m, c) => Math.max(m, c.y + BAR_H), MARGIN.top) + MARGIN.bottom,
      ),
);
const computedWidth = computed(() =>
  cells.value.length === 0
    ? resolvedWidth.value
    : Math.max(
        resolvedWidth.value,
        cells.value.reduce((m, c) => Math.max(m, c.x + BAR_W), MARGIN.left) + MARGIN.right,
      ),
);

const dataValueItems = computed(() => cells.value.map((c) => `${'·'.repeat(c.level)}${c.label}: ${c.value}`));

const hoveredCell = computed(() =>
  hoveredKey.value !== null ? cells.value.find((c) => c.key === hoveredKey.value) ?? null : null,
);

const isLinkDim = (link: Link): boolean =>
  hoveredKey.value !== null && hoveredKey.value !== link.from.key && hoveredKey.value !== link.to.key;
const isCellDim = (cell: Cell): boolean => hoveredKey.value !== null && hoveredKey.value !== cell.key;
const cellChars = (cell: Cell): number => charsFor(cell.barWidth);
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-decompositionTreeChart', props.class)) }" >
    <div class="st-decompositionTreeChart__visual" role="img" :aria-label="label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${computedWidth} ${computedHeight}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <path v-for="link in links" :key="link.key" :class="classNames('st-decompositionTreeChart__link', isLinkDim(link) ? 'st-decompositionTreeChart__link--dim' : undefined)" :d="linkPath(link)"></path>
        <g v-for="cell in cells" :key="cell.key" class="st-decompositionTreeChart__node">
          <rect :class="classNames('st-decompositionTreeChart__bar', `st-decompositionTreeChart__bar--${cell.tone}`, isCellDim(cell) ? 'st-decompositionTreeChart__bar--dim' : undefined)" :x="cell.x" :y="cell.y" :width="Math.max(cell.barWidth, 2)" :height="BAR_H" rx="2" :data-chart-key="cell.key"></rect>
          <text v-if="cellChars(cell) >= 2" class="st-decompositionTreeChart__label" :x="cell.x + 4" :y="cell.y + BAR_H / 2" dominant-baseline="central">{{ ellipsize(cell.label, cellChars(cell)) }}</text>
        </g>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label ?? 'decomposition tree'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredCell" class="st-decompositionTreeChart__tooltip" role="presentation" :style="`left:${(hoveredCell.cx / computedWidth) * 100}%;top:${(hoveredCell.cy / computedHeight) * 100}%`">
      <span class="st-decompositionTreeChart__tooltipLabel">{{ `${hoveredCell.dimension} · ${hoveredCell.label}` }}</span>
      <span class="st-decompositionTreeChart__tooltipValue">{{ formatValue(hoveredCell.value) }}</span>
    </div>
  </div>
</template>
