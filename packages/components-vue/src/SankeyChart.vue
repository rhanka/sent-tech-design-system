<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type SankeyChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type SankeyChartNode = {
  id: string;
  label: string;
  tone?: SankeyChartTone;
};

export type SankeyChartLink = {
  source: string;
  target: string;
  value: number;
  tone?: SankeyChartTone;
};

export type SankeyChartProps = {
  nodes: SankeyChartNode[];
  links: SankeyChartLink[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 18, right: 26, bottom: 18, left: 26 } as const;
const NODE_WIDTH = 14;
const TONES: SankeyChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

type NodeLayout = {
  node: SankeyChartNode;
  tone: SankeyChartTone;
  x: number;
  y: number;
  width: number;
  height: number;
  centerY: number;
};

defineOptions({ name: 'SankeyChart', inheritAttrs: false });
const props = withDefaults(defineProps<SankeyChartProps>(), {
  width: 560, height: 280, class: undefined,
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

const width = computed(() => props.width ?? 560);
const height = computed(() => props.height ?? 280);
const label = computed(() => props.label);
const nodes = computed(() => props.nodes ?? []);
const links = computed(() => props.links ?? []);

// Compute depths (longest path from root)
const depths = computed(() => {
  const map = new Map(nodes.value.map((node) => [node.id, 0]));
  for (let pass = 0; pass < nodes.value.length; pass += 1) {
    let changed = false;
    for (const link of links.value) {
      const sourceDepth = map.get(link.source) ?? 0;
      const targetDepth = map.get(link.target) ?? 0;
      if (sourceDepth + 1 > targetDepth) {
        map.set(link.target, sourceDepth + 1);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return map;
});

// Conservation de flux : hauteur nœud = max(Σ flux sortants, Σ flux entrants)
const valueOut = computed(() => {
  const map = new Map<string, number>();
  for (const node of nodes.value) map.set(node.id, 0);
  for (const link of links.value) {
    const v = magnitude(link.value);
    map.set(link.source, (map.get(link.source) ?? 0) + v);
  }
  return map;
});
const valueIn = computed(() => {
  const map = new Map<string, number>();
  for (const node of nodes.value) map.set(node.id, 0);
  for (const link of links.value) {
    const v = magnitude(link.value);
    map.set(link.target, (map.get(link.target) ?? 0) + v);
  }
  return map;
});
const nodeValues = computed(() => {
  const map = new Map<string, number>();
  for (const node of nodes.value) {
    map.set(node.id, Math.max(valueOut.value.get(node.id) ?? 0, valueIn.value.get(node.id) ?? 0));
  }
  return map;
});

const maxDepth = computed(() => Math.max(0, ...Array.from(depths.value.values())));
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right - NODE_WIDTH, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));
const maxNodeValue = computed(() => Math.max(1, ...Array.from(nodeValues.value.values())));

const byDepth = computed(() => {
  const map = new Map<number, SankeyChartNode[]>();
  nodes.value.forEach((node) => {
    const depth = depths.value.get(node.id) ?? 0;
    const bucket = map.get(depth) ?? [];
    bucket.push(node);
    map.set(depth, bucket);
  });
  return map;
});

const positionedNodes = computed<NodeLayout[]>(() =>
  nodes.value.map((node, index) => {
    const depth = depths.value.get(node.id) ?? 0;
    const bucket = byDepth.value.get(depth) ?? [node];
    const row = Math.max(0, bucket.findIndex((entry) => entry.id === node.id));
    const slot = plotHeight.value / Math.max(bucket.length, 1);
    const nodeHeight = Math.max(24, Math.min(slot * 0.72, 18 + ((nodeValues.value.get(node.id) ?? 0) / maxNodeValue.value) * 54));
    const x = MARGIN.left + (maxDepth.value === 0 ? plotWidth.value / 2 : (plotWidth.value * depth) / maxDepth.value);
    const y = MARGIN.top + slot * row + (slot - nodeHeight) / 2;
    const tone = node.tone ?? TONES[index % TONES.length];
    return { node, tone, x, y, width: NODE_WIDTH, height: nodeHeight, centerY: y + nodeHeight / 2 };
  }),
);

const positionedById = computed(() => new Map(positionedNodes.value.map((n) => [n.node.id, n])));
const maxLinkValue = computed(() => Math.max(1, ...links.value.map((link) => magnitude(link.value))));
const nodeById = computed(() => new Map(nodes.value.map((node) => [node.id, node])));

// No silent drop for orphan links - use fallback position
type PositionedLink = {
  link: SankeyChartLink;
  source: NodeLayout | undefined;
  target: NodeLayout | undefined;
  tone: SankeyChartTone;
  width: number;
  path: string;
  midX: number;
  midY: number;
};
const positionedLinks = computed<PositionedLink[]>(() =>
  links.value.map((link, index) => {
    const source = positionedById.value.get(link.source);
    const target = positionedById.value.get(link.target);
    const fallbackY = MARGIN.top + plotHeight.value / 2;
    const x1 = (source?.x ?? MARGIN.left) + NODE_WIDTH;
    const y1 = source?.centerY ?? fallbackY;
    const x2 = target?.x ?? width.value - MARGIN.right;
    const y2 = target?.centerY ?? fallbackY;
    const c = Math.max(32, Math.abs(x2 - x1) * 0.5);
    return {
      link,
      source,
      target,
      tone: link.tone ?? source?.tone ?? TONES[index % TONES.length],
      width: Math.max(2, (magnitude(link.value) / maxLinkValue.value) * 18),
      path: `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`,
      midX: (x1 + x2) / 2,
      midY: (y1 + y2) / 2,
    };
  }),
);

const dataValueItems = computed(() =>
  links.value.map((link) => {
    const src = nodeById.value.get(link.source)?.label ?? link.source;
    const tgt = nodeById.value.get(link.target)?.label ?? link.target;
    return `${src} -> ${tgt}: ${link.value}`;
  }),
);

const hoveredFlow = computed(() =>
  hoveredLinkIndex.value !== null ? positionedLinks.value[hoveredLinkIndex.value] : undefined,
);

function isDim(i: number): boolean {
  return hoveredLinkIndex.value !== null && hoveredLinkIndex.value !== i;
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-sankeyChart', props.class)">
    <div
      class="st-sankeyChart__visual"
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
          v-for="(flow, i) in positionedLinks"
          :key="`${flow.link.source}-${flow.link.target}-${i}`"
          :class="classNames(
            'st-sankeyChart__link',
            `st-sankeyChart__link--${flow.tone}`,
            isDim(i) ? 'st-sankeyChart__link--dim' : undefined,
          )"
          :d="flow.path"
          :stroke-width="flow.width"
          :data-link-index="i"
        />
        <template v-for="entry in positionedNodes" :key="`n${entry.node.id}`">
          <rect
            :class="classNames('st-sankeyChart__node', `st-sankeyChart__node--${entry.tone}`)"
            :x="entry.x"
            :y="entry.y"
            :width="entry.width"
            :height="entry.height"
            rx="2"
          />
          <text
            class="st-sankeyChart__nodeLabel"
            :x="entry.x + entry.width + 6"
            :y="entry.centerY"
            dominant-baseline="middle"
          >{{ entry.node.label }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredFlow"
      class="st-sankeyChart__tooltip"
      role="presentation"
      :style="`left: ${(hoveredFlow.midX / width) * 100}%; top: ${(hoveredFlow.midY / height) * 100}%`"
    >
      <span class="st-sankeyChart__tooltipLabel">{{ `${hoveredFlow.source?.node.label ?? hoveredFlow.link.source} -> ${hoveredFlow.target?.node.label ?? hoveredFlow.link.target}` }}</span>
      <span class="st-sankeyChart__tooltipValue">{{ String(hoveredFlow.link.value) }}</span>
    </div>
  </div>
</template>
