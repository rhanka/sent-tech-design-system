<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { contrastTextForTone } from './chartContrast.js';
import GraphLegend from './GraphLegend.vue';

export type DependencyWheelChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type DependencyWheelChartLink = {
  from: string;
  to: string;
  weight: number;
};

export type DependencyWheelChartProps = {
  data: DependencyWheelChartLink[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: DependencyWheelChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

const GAP = 0.04;
const ARC_WIDTH = 12;

const magnitude = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : 0;

const polar = (cx: number, cy: number, radius: number, angle: number): [number, number] =>
  [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];

const arcPath = (cx: number, cy: number, inner: number, outer: number, start: number, end: number): string => {
  const large = end - start > Math.PI ? 1 : 0;
  const [x0o, y0o] = polar(cx, cy, outer, start);
  const [x1o, y1o] = polar(cx, cy, outer, end);
  const [x1i, y1i] = polar(cx, cy, inner, end);
  const [x0i, y0i] = polar(cx, cy, inner, start);
  return `M ${x0o} ${y0o} A ${outer} ${outer} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${inner} ${inner} 0 ${large} 0 ${x0i} ${y0i} Z`;
};

type ArcDatum = {
  id: string;
  tone: DependencyWheelChartTone;
  value: number;
  span: number;
  path: string;
  labelX: number;
  labelY: number;
  textColor: string;
};

type RibbonDatum = {
  index: number;
  from: string;
  to: string;
  weight: number;
  tone: DependencyWheelChartTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

type LegendDatum = { label: string; shape: 'circle'; tone: DependencyWheelChartTone };

defineOptions({ name: 'DependencyWheelChart', inheritAttrs: false });
const props = withDefaults(defineProps<DependencyWheelChartProps>(), {
  labels: undefined,
  width: 480,
  height: 240,
  class: undefined,
});

const hoveredLinkIndex = ref<number | null>(null);

const handleLeave = () => {
  hoveredLinkIndex.value = null;
};

const handleVisualPointerMove = (event: PointerEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredLinkIndex.value = null;
    return;
  }
  const index = Number(target.getAttribute('data-link-index'));
  hoveredLinkIndex.value = Number.isInteger(index) ? index : null;
};

const data = computed(() => props.data);
const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);
const label = computed(() => props.label);
const displayLabel = (id: string): string => props.labels?.[id] ?? id;

const cx = computed(() => width.value / 2);
const cy = computed(() => height.value / 2);
const outer = computed(() => Math.max(Math.min(width.value, height.value) / 2 - 6, 1));
const inner = computed(() => Math.max(outer.value - ARC_WIDTH, 1));
const ribbonRadius = computed(() => Math.max(inner.value - 2, 0));

const links = computed(() => data.value
  .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
  .filter((entry) => entry.weight > 0),
);

const built = computed(() => {
  const order: string[] = [];
  const total = new Map<string, number>();
  for (const { link, weight } of links.value) {
    for (const id of [link.from, link.to]) {
      if (!total.has(id)) {
        total.set(id, 0);
        order.push(id);
      }
    }
    total.set(link.from, (total.get(link.from) ?? 0) + weight);
    total.set(link.to, (total.get(link.to) ?? 0) + weight);
  }

  const grandTotal = order.reduce((sum, id) => sum + (total.get(id) ?? 0), 0);

  const arcs: ArcDatum[] = [];
  const ribbons: RibbonDatum[] = [];
  const legend: LegendDatum[] = [];

  if (order.length > 0 && grandTotal > 0) {
    const totalGap = GAP * order.length;
    const usable = Math.max(Math.PI * 2 - totalGap, 0.0001);

    type ArcInfo = { tone: DependencyWheelChartTone; cursor: number };
    const arcMap = new Map<string, ArcInfo>();

    let angle = -Math.PI / 2;
    order.forEach((id, index) => {
      const span = (usable * (total.get(id) ?? 0)) / grandTotal;
      const start = angle + GAP / 2;
      const end = start + span;
      angle = end + GAP / 2;
      const tone = TONES[index % TONES.length];
      const mid = (start + end) / 2;
      arcMap.set(id, { tone, cursor: start });
      const labelRadius = (inner.value + outer.value) / 2;
      const [lx, ly] = polar(cx.value, cy.value, labelRadius, mid);
      arcs.push({
        id,
        tone,
        value: total.get(id) ?? 0,
        span,
        path: arcPath(cx.value, cy.value, inner.value, outer.value, start, end),
        labelX: lx,
        labelY: ly,
        textColor: contrastTextForTone(tone),
      });
    });

    const maxWeight = Math.max(1, ...links.value.map((entry) => entry.weight));
    links.value.forEach(({ link, weight, index }) => {
      const source = arcMap.get(link.from)!;
      const target = arcMap.get(link.to)!;
      const sourceSpan = (usable * weight) / grandTotal;
      const targetSpan = (usable * weight) / grandTotal;
      const s0 = source.cursor;
      const s1 = source.cursor + sourceSpan;
      source.cursor = s1;
      const t0 = target.cursor;
      const t1 = target.cursor + targetSpan;
      target.cursor = t1;

      const [ps0x, ps0y] = polar(cx.value, cy.value, ribbonRadius.value, s0);
      const [ps1x, ps1y] = polar(cx.value, cy.value, ribbonRadius.value, s1);
      const [pt0x, pt0y] = polar(cx.value, cy.value, ribbonRadius.value, t0);
      const [pt1x, pt1y] = polar(cx.value, cy.value, ribbonRadius.value, t1);

      const path =
        `M ${ps0x} ${ps0y} ` +
        `Q ${cx.value} ${cy.value} ${pt1x} ${pt1y} ` +
        `A ${ribbonRadius.value} ${ribbonRadius.value} 0 0 1 ${pt0x} ${pt0y} ` +
        `Q ${cx.value} ${cy.value} ${ps1x} ${ps1y} ` +
        `A ${ribbonRadius.value} ${ribbonRadius.value} 0 0 0 ${ps0x} ${ps0y} Z`;

      ribbons.push({
        index,
        from: link.from,
        to: link.to,
        weight,
        tone: source.tone,
        strokeWidth: Math.max(1, (weight / maxWeight) * 4),
        path,
        midX: cx.value,
        midY: cy.value,
      });
    });

    arcs.forEach((arc) => {
      legend.push({ label: displayLabel(arc.id), shape: 'circle', tone: arc.tone });
    });
  }
  return { arcs, ribbons, legend };
});
const arcs = computed(() => built.value.arcs);
const ribbons = computed(() => built.value.ribbons);
const legend = computed(() => built.value.legend);

const dataValueItems = computed(() => data.value
  .filter((link) => magnitude(link.weight) > 0)
  .map((link) => `${displayLabel(link.from)} -> ${displayLabel(link.to)}: ${link.weight}`),
);

const hovered = computed(() =>
  hoveredLinkIndex.value !== null ? ribbons.value.find((r) => r.index === hoveredLinkIndex.value) : undefined,
);

const isRibbonDim = (ribbon: RibbonDatum): boolean =>
  hoveredLinkIndex.value !== null && hoveredLinkIndex.value !== ribbon.index;

type ArcNode = { kind: 'path'; arc: ArcDatum } | { kind: 'text'; arc: ArcDatum };
const arcNodes = computed<ArcNode[]>(() => arcs.value.flatMap((arc): ArcNode[] => {
  const nodes: ArcNode[] = [{ kind: 'path', arc }];
  if (arc.span > 0.34) nodes.push({ kind: 'text', arc });
  return nodes;
}));
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-dependencyWheelChart', props.class)">
    <div class="st-dependencyWheelChart__visual" role="img" :aria-label="label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <g class="st-dependencyWheelChart__ribbons">
          <path v-for="ribbon in ribbons" :key="ribbon.index" :class="classNames('st-dependencyWheelChart__ribbon', `st-dependencyWheelChart__ribbon--${ribbon.tone}`, isRibbonDim(ribbon) ? 'st-dependencyWheelChart__ribbon--dim' : undefined)" :d="ribbon.path" :stroke-width="ribbon.strokeWidth" :data-link-index="ribbon.index"></path>
        </g>
        <g class="st-dependencyWheelChart__arcs">
          <template v-for="node in arcNodes" :key="node.kind === 'path' ? node.arc.id : `lbl${node.arc.id}`">
            <path v-if="node.kind === 'path'" :key="`arc${node.arc.id}`" :class="classNames('st-dependencyWheelChart__arc', `st-dependencyWheelChart__arc--${node.arc.tone}`)" :d="node.arc.path"></path>
            <text v-else :key="`lblt${node.arc.id}`" class="st-dependencyWheelChart__arcLabel" :x="node.arc.labelX" :y="node.arc.labelY" text-anchor="middle" dominant-baseline="middle" :fill="node.arc.textColor">{{ displayLabel(node.arc.id) }}</text>
          </template>
        </g>
      </svg>
      <GraphLegend v-if="legend.length > 0" class="st-dependencyWheelChart__legend" :entries="legend" />
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-dependencyWheelChart__tooltip" role="presentation" :style="`left: ${(hovered.midX / width) * 100}%; top: ${(hovered.midY / height) * 100}%`">
      <span class="st-dependencyWheelChart__tooltipLabel">{{ `${displayLabel(hovered.from)} -> ${displayLabel(hovered.to)}` }}</span>
      <span class="st-dependencyWheelChart__tooltipValue">{{ String(hovered.weight) }}</span>
    </div>
  </div>
</template>
