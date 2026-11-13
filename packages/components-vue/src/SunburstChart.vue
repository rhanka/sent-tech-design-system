<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { contrastTextForTone } from './chartContrast.js';

export type SunburstChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type SunburstChartDatum = {
  label: string;
  value?: number;
  tone?: SunburstChartTone;
  children?: SunburstChartDatum[];
};

export type SunburstChartProps = {
  data: SunburstChartDatum;
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

const TONES: SunburstChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];
const TWO_PI = Math.PI * 2;

type ArcDatum = {
  datum: SunburstChartDatum;
  pathLabel: string[];
  value: number;
  tone: SunburstChartTone;
  depth: number;
  start: number;
  end: number;
  path: string;
  labelX: number;
  labelY: number;
  index: number;
};

function leafValue(value: number | undefined): number {
  return Number.isFinite(value) && (value ?? 0) > 0 ? (value as number) : 0;
}

function sumValue(node: SunburstChartDatum): number {
  if (node.children && node.children.length > 0) {
    return node.children.reduce((sum, child) => sum + sumValue(child), 0);
  }
  return leafValue(node.value);
}

function maxDepth(node: SunburstChartDatum, depth = 0): number {
  if (!node.children || node.children.length === 0) return depth;
  return Math.max(depth, ...node.children.map((child) => maxDepth(child, depth + 1)));
}

function polar(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function arcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, start: number, end: number): string {
  const safeEnd = Math.min(end, start + TWO_PI - 0.0001);
  const large = safeEnd - start > Math.PI ? 1 : 0;
  const [x0o, y0o] = polar(cx, cy, outerRadius, start);
  const [x1o, y1o] = polar(cx, cy, outerRadius, safeEnd);

  if (innerRadius <= 0) {
    return `M ${cx} ${cy} L ${x0o} ${y0o} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${x1o} ${y1o} Z`;
  }

  const [x1i, y1i] = polar(cx, cy, innerRadius, safeEnd);
  const [x0i, y0i] = polar(cx, cy, innerRadius, start);
  return `M ${x0o} ${y0o} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${x0i} ${y0i} Z`;
}

function collectLeafItems(node: SunburstChartDatum, path: string[]): string[] {
  if (node.children && node.children.length > 0) {
    return node.children.flatMap((child) => collectLeafItems(child, [...path, child.label]));
  }
  const v = leafValue(node.value);
  if (v === 0) return [];
  return [`${path.join(', ')}: ${v}`];
}

defineOptions({ name: 'SunburstChart', inheritAttrs: false });
const props = withDefaults(defineProps<SunburstChartProps>(), {
  width: 320, height: 320, legend: false, class: undefined,
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

const width = computed(() => props.width ?? 320);
const height = computed(() => props.height ?? 320);
const legend = computed(() => props.legend ?? false);
const label = computed(() => props.label);
const data = computed(() => props.data);

const cx = computed(() => width.value / 2);
const cy = computed(() => height.value / 2);
const ringCount = computed(() => Math.max(1, maxDepth(data.value)));
const outerLimit = computed(() => Math.max(Math.min(width.value, height.value) / 2 - 6, 1));
const ring = computed(() => outerLimit.value / ringCount.value);
const total = computed(() => sumValue(data.value));

const arcs = computed<ArcDatum[]>(() => {
  const result: ArcDatum[] = [];

  function visit(
    node: SunburstChartDatum,
    depth: number,
    start: number,
    end: number,
    pathLabel: string[],
    inheritedTone: SunburstChartTone,
    siblingIndex: number,
  ) {
    if (depth > 0) {
      const tone = node.tone ?? inheritedTone ?? TONES[siblingIndex % TONES.length];
      const innerRadius = (depth - 1) * ring.value;
      const outerRadius = depth * ring.value;
      const midAngle = (start + end) / 2;
      const midRadius = (innerRadius + outerRadius) / 2;
      const [lx, ly] = polar(cx.value, cy.value, midRadius, midAngle);
      const index = result.length;
      result.push({
        datum: node,
        pathLabel,
        value: sumValue(node),
        tone,
        depth,
        start,
        end,
        path: arcPath(cx.value, cy.value, innerRadius, outerRadius, start, end),
        labelX: lx,
        labelY: ly,
        index,
      });
    }

    const children = node.children ?? [];
    const nodeTotal = children.reduce((sum, child) => sum + sumValue(child), 0);
    if (children.length === 0 || nodeTotal <= 0) return;

    let cursor = start;
    children.forEach((child, childIndex) => {
      const value = sumValue(child);
      if (value <= 0) return;
      const span = ((end - start) * value) / nodeTotal;
      const tone = child.tone ?? (depth === 0 ? TONES[childIndex % TONES.length] : inheritedTone);
      visit(child, depth + 1, cursor, cursor + span, [...pathLabel, child.label], tone, childIndex);
      cursor += span;
    });
  }

  if (total.value > 0 && data.value.children && data.value.children.length > 0) {
    visit(data.value, 0, -Math.PI / 2, Math.PI * 1.5, [data.value.label], 'category1' as SunburstChartTone, 0);
  }
  return result;
});

const leafItems = computed(() => collectLeafItems(data.value, [data.value.label]));
const hovered = computed(() => (hoveredIndex.value !== null ? arcs.value[hoveredIndex.value] : undefined));

const legendItems = computed(() =>
  (data.value.children ?? []).map((child, index) => ({
    label: child.label,
    tone: child.tone ?? TONES[index % TONES.length],
  })),
);

function isDim(i: number): boolean {
  return hoveredIndex.value !== null && hoveredIndex.value !== i;
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-sunburstChart', props.class)">
    <div
      class="st-sunburstChart__visual"
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
        <path
          v-for="(arc, i) in arcs"
          :key="arc.pathLabel.join('/')"
          :class="classNames(
            'st-sunburstChart__arc',
            `st-sunburstChart__arc--${arc.tone}`,
            isDim(i) ? 'st-sunburstChart__arc--dim' : undefined,
          )"
          :d="arc.path"
          :data-chart-index="arc.index"
        />
        <template v-for="arc in arcs" :key="`lbl${arc.pathLabel.join('/')}`">
          <text
            v-if="arc.end - arc.start > 0.28"
            class="st-sunburstChart__label"
            :x="arc.labelX"
            :y="arc.labelY"
            text-anchor="middle"
            dominant-baseline="middle"
            :fill="contrastTextForTone(arc.tone)"
          >{{ arc.datum.label }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="leafItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in leafItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-sunburstChart__tooltip"
      role="presentation"
      :style="`left: ${(hovered.labelX / width) * 100}%; top: ${(hovered.labelY / height) * 100}%`"
    >
      <span class="st-sunburstChart__tooltipLabel">{{ hovered.pathLabel.join(', ') }}</span>
      <span class="st-sunburstChart__tooltipValue">{{ String(hovered.value) }}</span>
    </div>
    <ul v-if="legend && legendItems.length > 0" class="st-sunburstChart__legend" aria-hidden="true">
      <li v-for="item in legendItems" :key="item.label" class="st-sunburstChart__legendItem">
        <span :class="`st-sunburstChart__legendSwatch st-sunburstChart__legendSwatch--${item.tone}`" aria-hidden="true" />{{ ` ${item.label}` }}
      </li>
    </ul>
  </div>
</template>
