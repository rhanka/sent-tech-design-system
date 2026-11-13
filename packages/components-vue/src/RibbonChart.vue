<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type RibbonChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type RibbonChartDatum = {
  category: string;
  period: string | number;
  value: number;
  tone?: RibbonChartTone;
};

export type RibbonChartProps = {
  data: RibbonChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 16 };
const RIBBON_SMOOTH = 0.4;

defineOptions({ name: 'RibbonChart', inheritAttrs: false });
const props = withDefaults(defineProps<RibbonChartProps>(), {
  data: () => [], label: undefined, width: undefined, height: 300, size: undefined, class: undefined,
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
const label = computed(() => props.label);

const validData = computed(() =>
  (props.data ?? []).filter(
    (d) =>
      typeof d.category === 'string' &&
      d.category.length > 0 &&
      Number.isFinite(d.value) &&
      d.value >= 0,
  ),
);

const periodOrder = computed<(string | number)[]>(() => {
  const order: (string | number)[] = [];
  for (const d of validData.value) {
    if (!order.includes(d.period)) order.push(d.period);
  }
  return order;
});

const categoryOrder = computed<string[]>(() => {
  const order: string[] = [];
  for (const d of validData.value) {
    if (!order.includes(d.category)) order.push(d.category);
  }
  return order;
});

const explicitToneByCategory = computed(() => {
  const map = new Map<string, RibbonChartTone>();
  for (const d of validData.value) {
    if (d.tone) map.set(d.category, d.tone);
  }
  return map;
});

function toneOf(category: string): RibbonChartTone {
  const explicit = explicitToneByCategory.value.get(category);
  if (explicit) return explicit;
  const idx = categoryOrder.value.indexOf(category);
  return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as RibbonChartTone;
}

type Segment = {
  key: string;
  category: string;
  value: number;
  tone: RibbonChartTone;
  x: number;
  width: number;
  yTop: number;
  yBottom: number;
  cx: number;
  cy: number;
};

type Column = {
  period: string | number;
  index: number;
  cx: number;
  segments: Segment[];
};

type Ribbon = { key: string; category: string; tone: RibbonChartTone; d: string };

const plotWidth = computed(() => Math.max(resolvedWidth.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

const columns = computed<Column[]>(() => {
  const valid = validData.value;
  const periods = periodOrder.value;
  if (valid.length === 0 || periods.length === 0) return [];
  const band = plotWidth.value / periods.length;
  const barWidth = Math.min(band * 0.5, 72);
  const totals = periods.map((p) =>
    valid.filter((d) => d.period === p).reduce((s, d) => s + Math.max(d.value, 0), 0),
  );
  const domainMax = Math.max(1, ...totals);
  return periods.map((period, pi) => {
    const x = MARGIN.left + band * pi + (band - barWidth) / 2;
    const rows = valid
      .filter((d) => d.period === period)
      .map((d) => ({ category: d.category, value: Math.max(d.value, 0) }))
      .sort((a, b) => b.value - a.value);
    let acc = 0;
    const segments: Segment[] = rows.map((row, ri) => {
      const seg = (row.value / domainMax) * plotHeight.value;
      const yBottom = MARGIN.top + plotHeight.value - acc;
      const yTop = yBottom - seg;
      acc += seg;
      return {
        key: `${pi}-${ri}-${row.category}`,
        category: row.category,
        value: row.value,
        tone: toneOf(row.category),
        x,
        width: barWidth,
        yTop,
        yBottom,
        cx: x + barWidth / 2,
        cy: yTop + (yBottom - yTop) / 2,
      };
    });
    return { period, index: pi, cx: MARGIN.left + band * (pi + 0.5), segments };
  });
});

const ribbons = computed<Ribbon[]>(() => {
  const result: Ribbon[] = [];
  const cols = columns.value;
  for (let ci = 0; ci < cols.length - 1; ci++) {
    const left = cols[ci];
    const right = cols[ci + 1];
    for (const ls of left.segments) {
      const rs = right.segments.find((s) => s.category === ls.category);
      if (!rs) continue;
      const x0 = ls.x + ls.width;
      const x1 = rs.x;
      const mid = x0 + (x1 - x0) * RIBBON_SMOOTH;
      const mid2 = x1 - (x1 - x0) * RIBBON_SMOOTH;
      const d =
        `M${x0.toFixed(2)},${ls.yTop.toFixed(2)} ` +
        `C${mid.toFixed(2)},${ls.yTop.toFixed(2)} ${mid2.toFixed(2)},${rs.yTop.toFixed(2)} ${x1.toFixed(2)},${rs.yTop.toFixed(2)} ` +
        `L${x1.toFixed(2)},${rs.yBottom.toFixed(2)} ` +
        `C${mid2.toFixed(2)},${rs.yBottom.toFixed(2)} ${mid.toFixed(2)},${ls.yBottom.toFixed(2)} ${x0.toFixed(2)},${ls.yBottom.toFixed(2)} Z`;
      result.push({ key: `${ci}-${ls.category}`, category: ls.category, tone: ls.tone, d });
    }
  }
  return result;
});

const legendItems = computed(() =>
  categoryOrder.value.map((category) => ({ category, tone: toneOf(category) })),
);
const hasLegend = computed(() => categoryOrder.value.length > 0);

const dataValueItems = computed(() =>
  categoryOrder.value.map(
    (category) =>
      `${category}: ${periodOrder.value
        .map((p) => {
          const found = validData.value.find((d) => d.category === category && d.period === p);
          return `${p} = ${found ? found.value : 0}`;
        })
        .join(', ')}`,
  ),
);

const hoveredSegment = computed<Segment | null>(() => {
  if (hoveredKey.value === null) return null;
  for (const col of columns.value) {
    for (const seg of col.segments) {
      if (seg.key === hoveredKey.value) return seg;
    }
  }
  return null;
});

function isRibbonDim(ribbon: Ribbon): boolean {
  return hoveredSegment.value !== null && hoveredSegment.value.category !== ribbon.category;
}
function isSegDim(seg: Segment): boolean {
  return hoveredSegment.value !== null && hoveredSegment.value.category !== seg.category;
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-ribbonChart', props.class)">
    <div
      class="st-ribbonChart__visual"
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
        <path
          v-for="ribbon in ribbons"
          :key="`r${ribbon.key}`"
          :class="classNames(
            'st-ribbonChart__ribbon',
            `st-ribbonChart__ribbon--${ribbon.tone}`,
            isRibbonDim(ribbon) ? 'st-ribbonChart__ribbon--dim' : undefined,
          )"
          :d="ribbon.d"
        />
        <template v-for="col in columns" :key="`col${col.index}`">
          <text
            class="st-ribbonChart__periodLabel"
            :x="col.cx"
            :y="height - MARGIN.bottom + 16"
            text-anchor="middle"
          >{{ String(col.period) }}</text>
          <rect
            v-for="seg in col.segments"
            :key="`s${seg.key}`"
            :class="classNames(
              'st-ribbonChart__seg',
              `st-ribbonChart__seg--${seg.tone}`,
              isSegDim(seg) ? 'st-ribbonChart__seg--dim' : undefined,
            )"
            :x="seg.x"
            :y="seg.yTop"
            :width="seg.width"
            :height="Math.max(seg.yBottom - seg.yTop, 0)"
            rx="2"
            :data-chart-key="seg.key"
          />
        </template>
      </svg>
    </div>
    <ul v-if="hasLegend" class="st-ribbonChart__legend" :aria-label="`Catégories de ${label ?? 'ribbon'}`">
      <li v-for="item in legendItems" :key="item.category" class="st-ribbonChart__legendItem">
        <span :class="`st-ribbonChart__legendSwatch st-ribbonChart__legendSwatch--${item.tone}`" aria-hidden="true" />{{ item.category }}
      </li>
    </ul>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label ?? 'ribbon'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredSegment"
      class="st-ribbonChart__tooltip"
      role="presentation"
      :style="`left:${(hoveredSegment.cx / resolvedWidth) * 100}%;top:${(hoveredSegment.cy / height) * 100}%`"
    >
      <span class="st-ribbonChart__tooltipLabel">{{ hoveredSegment.category }}</span>
      <span class="st-ribbonChart__tooltipValue">{{ `${hoveredSegment.value}` }}</span>
    </div>
  </div>
</template>
