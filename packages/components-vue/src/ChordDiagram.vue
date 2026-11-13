<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { contrastTextForTone } from './chartContrast.js';

export type ChordDiagramTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ChordDiagramFlow = {
  from: string;
  to: string;
  value: number;
};

export type ChordDiagramProps = {
  data: ChordDiagramFlow[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: ChordDiagramTone[] = [
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
const ARC_WIDTH = 14;

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function polar(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  const [x0o, y0o] = polar(cx, cy, outer, start);
  const [x1o, y1o] = polar(cx, cy, outer, end);
  const [x1i, y1i] = polar(cx, cy, inner, end);
  const [x0i, y0i] = polar(cx, cy, inner, start);
  return `M ${x0o} ${y0o} A ${outer} ${outer} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${inner} ${inner} 0 ${large} 0 ${x0i} ${y0i} Z`;
}

type ArcDatum = {
  id: string;
  tone: ChordDiagramTone;
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
  value: number;
  tone: ChordDiagramTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

defineOptions({ name: 'ChordDiagram', inheritAttrs: false });
const props = withDefaults(defineProps<ChordDiagramProps>(), {
  labels: undefined,
  width: 360,
  height: 360,
  class: undefined,
});

const hoveredFlowIndex = ref<number | null>(null);

function handleLeave() {
  hoveredFlowIndex.value = null;
}

function handleVisualPointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredFlowIndex.value = null;
    return;
  }
  const index = Number(target.getAttribute('data-flow-index'));
  hoveredFlowIndex.value = Number.isInteger(index) ? index : null;
}

function displayLabel(id: string) {
  return props.labels?.[id] ?? id;
}

const width = computed(() => props.width ?? 360);
const height = computed(() => props.height ?? 360);

const cx = computed(() => width.value / 2);
const cy = computed(() => height.value / 2);
const outer = computed(() => Math.max(Math.min(width.value, height.value) / 2 - 6, 1));
const inner = computed(() => Math.max(outer.value - ARC_WIDTH, 1));
const ribbonRadius = computed(() => Math.max(inner.value - 2, 0));

const flows = computed(() =>
  props.data
    .map((flow, index) => ({ flow, index, value: magnitude(flow.value) }))
    .filter((entry) => entry.value > 0),
);

const computedArcs = computed((): { arcs: ArcDatum[]; ribbons: RibbonDatum[] } => {
  const order: string[] = [];
  const total = new Map<string, number>();
  for (const { flow, value } of flows.value) {
    for (const id of [flow.from, flow.to]) {
      if (!total.has(id)) {
        total.set(id, 0);
        order.push(id);
      }
    }
    total.set(flow.from, (total.get(flow.from) ?? 0) + value);
    total.set(flow.to, (total.get(flow.to) ?? 0) + value);
  }

  const grandTotal = order.reduce((sum, id) => sum + (total.get(id) ?? 0), 0);

  const arcs: ArcDatum[] = [];
  const ribbons: RibbonDatum[] = [];

  if (order.length > 0 && grandTotal > 0) {
    const totalGap = GAP * order.length;
    const usable = Math.max(Math.PI * 2 - totalGap, 0.0001);

    type ArcInfo = { tone: ChordDiagramTone; cursor: number };
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

    const maxValue = Math.max(1, ...flows.value.map((entry) => entry.value));
    flows.value.forEach(({ flow, value, index }) => {
      const source = arcMap.get(flow.from)!;
      const target = arcMap.get(flow.to)!;
      const sourceSpan = (usable * value) / grandTotal;
      const targetSpan = (usable * value) / grandTotal;
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
        from: flow.from,
        to: flow.to,
        value,
        tone: source.tone,
        strokeWidth: Math.max(1, (value / maxValue) * 4),
        path,
        midX: cx.value,
        midY: cy.value,
      });
    });
  }
  return { arcs, ribbons };
});

const arcs = computed(() => computedArcs.value.arcs);
const ribbons = computed(() => computedArcs.value.ribbons);

const dataValueItems = computed(() =>
  props.data
    .filter((flow) => magnitude(flow.value) > 0)
    .map((flow) => `${displayLabel(flow.from)} -> ${displayLabel(flow.to)}: ${flow.value}`),
);

const hovered = computed(() =>
  hoveredFlowIndex.value !== null ? ribbons.value.find((r) => r.index === hoveredFlowIndex.value) : undefined,
);
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-chordDiagram', props.class)) }" >
    <div
      class="st-chordDiagram__visual"
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
        <g class="st-chordDiagram__ribbons">
          <path
            v-for="ribbon in ribbons"
            :key="ribbon.index"
            :class="classNames(
              'st-chordDiagram__ribbon',
              `st-chordDiagram__ribbon--${ribbon.tone}`,
              hoveredFlowIndex !== null && hoveredFlowIndex !== ribbon.index
                ? 'st-chordDiagram__ribbon--dim'
                : undefined,
            )"
            :d="ribbon.path"
            :stroke-width="ribbon.strokeWidth"
            :data-flow-index="ribbon.index"
          />
        </g>
        <g class="st-chordDiagram__arcs">
          <template v-for="arc in arcs" :key="arc.id">
            <path :class="classNames('st-chordDiagram__arc', `st-chordDiagram__arc--${arc.tone}`)" :d="arc.path" />
            <text
              v-if="arc.span > 0.34"
              class="st-chordDiagram__arcLabel"
              :x="arc.labelX"
              :y="arc.labelY"
              text-anchor="middle"
              dominant-baseline="middle"
              :fill="arc.textColor"
            >{{ displayLabel(arc.id) }}</text>
          </template>
        </g>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-chordDiagram__tooltip"
      role="presentation"
      :style="`left: ${(hovered.midX / width) * 100}%; top: ${(hovered.midY / height) * 100}%`"
    >
      <span class="st-chordDiagram__tooltipLabel">{{ `${displayLabel(hovered.from)} -> ${displayLabel(hovered.to)}` }}</span>
      <span class="st-chordDiagram__tooltipValue">{{ String(hovered.value) }}</span>
    </div>
  </div>
</template>
