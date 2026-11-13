<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type TraceSpan = {
  spanId: string;
  parentSpanId?: string | null;
  service: string;
  start: number;
  duration: number;
};

export type TraceWaterfallChartProps = {
  data: { spans: TraceSpan[] };
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

// The original runtime prop is not required (it carries a default) even
// though the public type marks `data` required; keep the runtime optional so
// omitting `data` applies the default instead of warning, like the .ts did.
type TraceWaterfallChartResolvedProps = Omit<TraceWaterfallChartProps, 'data'> & {
  data?: { spans: TraceSpan[] };
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 152 };
const INDENT = 10;

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1 * pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// Truncate a label to the left margin width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return '…';
  return `${text.slice(0, maxChars - 1)}…`;
}

type OrderedSpan = { span: TraceSpan; depth: number };

type Bar = {
  span: TraceSpan;
  depth: number;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rowCenterY: number;
  cx: number;
  tone: string;
};

defineOptions({ name: 'TraceWaterfallChart', inheritAttrs: false });
const props = withDefaults(defineProps<TraceWaterfallChartResolvedProps>(), {
  data: () => ({ spans: [] }), label: undefined, width: undefined, height: 320,
  size: undefined, class: undefined,
});


const rootProps = computed(() => ({

  class: classNames('st-traceWaterfallChart', props.class),
}));

const hoveredIndex = ref<number | null>(null);

function handleLeave() {
  hoveredIndex.value = null;
}

function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    return;
  }
  const idx = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(idx) ? idx : null;
}

const height = computed(() => props.height ?? 320);
const resolvedWidth = computed(() => props.width ?? props.size ?? 640);
const plotWidth = computed(() => Math.max(resolvedWidth.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

// Hierarchical order: DFS from roots (missing/unknown parentSpanId).
const ordered = computed<OrderedSpan[]>(() => {
  // Normalise: drop spans missing id/service or with non-finite start/duration.
  const validSpans = (props.data?.spans ?? []).filter(
    (s) =>
      s &&
      typeof s.spanId === 'string' &&
      s.spanId.length > 0 &&
      typeof s.service === 'string' &&
      s.service.length > 0 &&
      Number.isFinite(s.start) &&
      Number.isFinite(s.duration),
  );

  const out: OrderedSpan[] = [];
  if (validSpans.length > 0) {
    const byId = new Map<string, TraceSpan>();
    for (const s of validSpans) if (!byId.has(s.spanId)) byId.set(s.spanId, s);

    const childrenOf = new Map<string, TraceSpan[]>();
    const roots: TraceSpan[] = [];
    for (const s of validSpans) {
      const p = s.parentSpanId;
      if (p == null || !byId.has(p) || p === s.spanId) {
        roots.push(s);
      } else {
        const list = childrenOf.get(p) ?? [];
        list.push(s);
        childrenOf.set(p, list);
      }
    }

    const seen = new Set<string>();
    const visit = (s: TraceSpan, depth: number) => {
      if (seen.has(s.spanId)) return;
      seen.add(s.spanId);
      out.push({ span: s, depth });
      for (const k of childrenOf.get(s.spanId) ?? []) visit(k, depth + 1);
    };
    for (const r of roots) visit(r, 0);
    for (const s of validSpans) if (!seen.has(s.spanId)) visit(s, 0);
  }
  return out;
});

// Distinct services (DFS first-seen order) → categoryN index (1..8, cycled).
const serviceOrder = computed(() => {
  const order: string[] = [];
  for (const o of ordered.value) {
    if (!order.includes(o.span.service)) order.push(o.span.service);
  }
  return order;
});

function toneOf(service: string): string {
  const idx = serviceOrder.value.indexOf(service);
  return `category${((idx < 0 ? 0 : idx) % 8) + 1}`;
}

const legendItems = computed(() => serviceOrder.value.map((service) => ({ service, tone: toneOf(service) })));
const hasLegend = computed(() => serviceOrder.value.length > 0);

const ticks = computed(() => {
  const vals: number[] = [];
  for (const o of ordered.value) vals.push(o.span.start, o.span.start + Math.max(o.span.duration, 0));
  const rawMin = vals.length === 0 ? 0 : Math.min(...vals);
  const rawMaxBase = vals.length === 0 ? 1 : Math.max(...vals);
  const rawMax = rawMaxBase === rawMin ? rawMin + 1 : rawMaxBase;
  return niceTicks(rawMin, rawMax, 5);
});

const domainMin = computed(() => ticks.value[0] ?? 0);
const domainMax = computed(() => ticks.value[ticks.value.length - 1] ?? 1);

function xOf(v: number): number {
  return MARGIN.left + scaleLinear(v, domainMin.value, domainMax.value, 0, plotWidth.value);
}

const bars = computed<Bar[]>(() => {
  if (ordered.value.length === 0) return [];
  const band = plotHeight.value / ordered.value.length;
  const barHeight = Math.min(band * 0.62, 24);
  return ordered.value.map((o, i) => {
    const x0 = xOf(o.span.start);
    const x1 = xOf(o.span.start + Math.max(o.span.duration, 0));
    const x = Math.min(x0, x1);
    const w = Math.max(Math.abs(x1 - x0), 1);
    const y = MARGIN.top + band * i + (band - barHeight) / 2;
    return {
      span: o.span,
      depth: o.depth,
      index: i,
      x,
      y,
      width: w,
      height: barHeight,
      rowCenterY: MARGIN.top + band * (i + 0.5),
      cx: x + w / 2,
      tone: toneOf(o.span.service),
    };
  });
});

const dataValueItems = computed(() => ordered.value.map(
  (o) =>
    `${'·'.repeat(o.depth)}${o.span.service}: ${o.span.start} → ${o.span.start + Math.max(o.span.duration, 0)}`,
));

const hovered = computed(() => hoveredIndex.value !== null ? bars.value[hoveredIndex.value] : undefined);

function barClass(bar: Bar) {
  const isDim = hoveredIndex.value !== null && hoveredIndex.value !== bar.index;
  return classNames(
    'st-traceWaterfallChart__bar',
    `st-traceWaterfallChart__bar--${bar.tone}`,
    isDim ? 'st-traceWaterfallChart__bar--dim' : undefined,
  );
}
</script>

<template>
  <div v-bind="{ ...$attrs, ...rootProps }">
    <div class="st-traceWaterfallChart__visual" role="img" :aria-label="props.label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${resolvedWidth} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="tick in ticks" :key="`g${tick}`">
          <line class="st-traceWaterfallChart__grid" :x1="xOf(tick)" :x2="xOf(tick)" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
          <text class="st-traceWaterfallChart__tickLabel" :x="xOf(tick)" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(tick) }}</text>
        </template>
        <line class="st-traceWaterfallChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-traceWaterfallChart__axis" :x1="MARGIN.left" :x2="resolvedWidth - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <template v-for="bar in bars" :key="bar.index">
          <text class="st-traceWaterfallChart__spanLabel" :x="MARGIN.left - 8" :y="bar.rowCenterY" text-anchor="end" dominant-baseline="middle">{{ ellipsize(bar.span.service, Math.max(2, 16 - bar.depth)) }}</text>
          <rect :class="barClass(bar)" :x="bar.x + bar.depth * INDENT" :y="bar.y" :width="Math.max(bar.width - bar.depth * INDENT, 1)" :height="bar.height" rx="2" :data-chart-index="bar.index" />
        </template>
      </svg>
    </div>
    <ul v-if="hasLegend" class="st-traceWaterfallChart__legend" :aria-label="`Services de ${props.label ?? 'trace'}`">
      <li v-for="item in legendItems" :key="item.service" class="st-traceWaterfallChart__legendItem"><span :class="`st-traceWaterfallChart__legendSwatch st-traceWaterfallChart__legendSwatch--${item.tone}`" aria-hidden="true" />{{ item.service }}</li>
    </ul>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label ?? 'trace waterfall'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-traceWaterfallChart__tooltip" role="presentation" :style="`left:${(hovered.cx / resolvedWidth) * 100}%;top:${(hovered.rowCenterY / height) * 100}%`">
      <span class="st-traceWaterfallChart__tooltipLabel">{{ hovered.span.service }}</span>
      <span class="st-traceWaterfallChart__tooltipValue">{{ `${hovered.span.start} → ${hovered.span.start + Math.max(hovered.span.duration, 0)}` }}</span>
    </div>
  </div>
</template>
