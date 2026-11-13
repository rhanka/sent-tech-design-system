<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import GraphLegend from './GraphLegend.vue';

export type ArcDiagramChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ArcDiagramChartLink = {
  from: string;
  to: string;
  weight: number;
};

export type ArcDiagramChartProps = {
  data: ArcDiagramChartLink[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: ArcDiagramChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

const MARGIN_X = 24;
const BASELINE_PAD = 28;
const MIN_NODE_R = 4;
const MAX_NODE_R = 9;

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

type NodeDatum = {
  id: string;
  tone: ArcDiagramChartTone;
  x: number;
  r: number;
  value: number;
};

type ArcDatum = {
  index: number;
  from: string;
  to: string;
  weight: number;
  tone: ArcDiagramChartTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

type LegendDatum = { label: string; shape: 'circle'; tone: ArcDiagramChartTone };

defineOptions({ name: 'ArcDiagramChart', inheritAttrs: false });
const props = withDefaults(defineProps<ArcDiagramChartProps>(), {
  labels: undefined,
  width: 480,
  height: 240,
  class: undefined,
});

const hoveredLinkIndex = ref<number | null>(null);

function handleLeave() {
  hoveredLinkIndex.value = null;
}

function handleVisualPointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredLinkIndex.value = null;
    return;
  }
  const index = Number(target.getAttribute('data-link-index'));
  hoveredLinkIndex.value = Number.isInteger(index) ? index : null;
}

function displayLabel(id: string) {
  return props.labels?.[id] ?? id;
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);
const baselineY = computed(() => height.value - BASELINE_PAD);

const links = computed(() =>
  props.data
    .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
    .filter((entry) => entry.weight > 0),
);

const order = computed(() => {
  const ids: string[] = [];
  const degree = new Map<string, number>();
  for (const { link, weight } of links.value) {
    for (const id of [link.from, link.to]) {
      if (!degree.has(id)) {
        degree.set(id, 0);
        ids.push(id);
      }
    }
    degree.set(link.from, (degree.get(link.from) ?? 0) + weight);
    degree.set(link.to, (degree.get(link.to) ?? 0) + weight);
  }
  return { ids, degree };
});

const nodes = computed((): NodeDatum[] => {
  const { ids, degree } = order.value;
  if (ids.length === 0) return [];
  const usable = Math.max(width.value - MARGIN_X * 2, 1);
  const step = ids.length > 1 ? usable / (ids.length - 1) : 0;
  const startX = ids.length > 1 ? MARGIN_X : width.value / 2;
  const maxDegree = Math.max(1, ...ids.map((id) => degree.get(id) ?? 0));
  return ids.map((id, index) => {
    const tone = TONES[index % TONES.length];
    const value = degree.get(id) ?? 0;
    return { id, tone, x: startX + step * index, r: MIN_NODE_R + (MAX_NODE_R - MIN_NODE_R) * (value / maxDegree), value };
  });
});

const nodeTone = computed(() => {
  const map = new Map<string, ArcDiagramChartTone>();
  for (const node of nodes.value) map.set(node.id, node.tone);
  return map;
});

const arcs = computed((): ArcDatum[] => {
  const { ids, degree } = order.value;
  if (ids.length === 0) return [];
  const usable = Math.max(width.value - MARGIN_X * 2, 1);
  const step = ids.length > 1 ? usable / (ids.length - 1) : 0;
  const startX = ids.length > 1 ? MARGIN_X : width.value / 2;
  const nodeX = new Map<string, number>();
  ids.forEach((id, index) => {
    nodeX.set(id, startX + step * index);
  });
  const maxWeight = Math.max(1, ...links.value.map((entry) => entry.weight));
  return links.value.map(({ link, weight, index }) => {
    const x1 = nodeX.get(link.from)!;
    const x2 = nodeX.get(link.to)!;
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const radius = (right - left) / 2;
    const sweep = x1 <= x2 ? 1 : 0;
    return {
      index,
      from: link.from,
      to: link.to,
      weight,
      tone: nodeTone.value.get(link.from)!,
      strokeWidth: Math.max(1.5, (weight / maxWeight) * 6),
      path: `M ${x1} ${baselineY.value} A ${radius} ${radius} 0 0 ${sweep} ${x2} ${baselineY.value}`,
      midX: (left + right) / 2,
      midY: baselineY.value - radius,
    };
  });
});

const legend = computed((): LegendDatum[] =>
  nodes.value.map((node) => ({ label: displayLabel(node.id), shape: 'circle', tone: node.tone })),
);

const dataValueItems = computed(() =>
  props.data
    .filter((link) => magnitude(link.weight) > 0)
    .map((link) => `${displayLabel(link.from)} -> ${displayLabel(link.to)}: ${link.weight}`),
);

const hovered = computed(() =>
  hoveredLinkIndex.value !== null ? arcs.value.find((a) => a.index === hoveredLinkIndex.value) : undefined,
);
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-arcDiagramChart', props.class)) }" >
    <div
      class="st-arcDiagramChart__visual"
      role="img"
      :aria-label="props.label"
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
        <line class="st-arcDiagramChart__axis" :x1="MARGIN_X" :y1="baselineY" :x2="width - MARGIN_X" :y2="baselineY" />
        <g class="st-arcDiagramChart__arcs">
          <path
            v-for="arc in arcs"
            :key="arc.index"
            :class="classNames(
              'st-arcDiagramChart__arc',
              `st-arcDiagramChart__arc--${arc.tone}`,
              hoveredLinkIndex !== null && hoveredLinkIndex !== arc.index
                ? 'st-arcDiagramChart__arc--dim'
                : undefined,
            )"
            :d="arc.path"
            :stroke-width="arc.strokeWidth"
            :data-link-index="arc.index"
          />
        </g>
        <g class="st-arcDiagramChart__nodes">
          <circle
            v-for="node in nodes"
            :key="node.id"
            :class="classNames('st-arcDiagramChart__node', `st-arcDiagramChart__node--${node.tone}`)"
            :cx="node.x"
            :cy="baselineY"
            :r="node.r"
          />
        </g>
      </svg>
      <GraphLegend v-if="legend.length > 0" class="st-arcDiagramChart__legend" :entries="legend" />
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-arcDiagramChart__tooltip"
      role="presentation"
      :style="`left: ${(hovered.midX / width) * 100}%; top: ${(hovered.midY / height) * 100}%`"
    >
      <span class="st-arcDiagramChart__tooltipLabel">{{ `${displayLabel(hovered.from)} -> ${displayLabel(hovered.to)}` }}</span>
      <span class="st-arcDiagramChart__tooltipValue">{{ String(hovered.weight) }}</span>
    </div>
  </div>
</template>
