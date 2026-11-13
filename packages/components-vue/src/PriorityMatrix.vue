<script setup lang="ts">
import { computed } from 'vue';
import { placePriorityLabels, type PriorityMatrixObstacle } from './priorityLabels.js';
import { classNames } from './classNames.js';

export type PriorityMatrixTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type PriorityMatrixDatum = {
  /** Complexité, 0–100 (bornée à l'affichage). */
  x: number;
  /** Valeur, 0–100 (bornée à l'affichage). */
  y: number;
  /** Étiquette affichée (une ou deux lignes). */
  label: string;
  tone?: PriorityMatrixTone;
};

export type PriorityMatrixProps = {
  data: PriorityMatrixDatum[];
  /** Titre visible au-dessus du cadre. */
  title?: string;
  xLabel?: string;
  yLabel?: string;
  /** Seuils de quadrants (0–100). */
  xThreshold?: number;
  yThreshold?: number;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 26, right: 18, bottom: 36, left: 48 } as const;
const TICKS = [0, 20, 40, 60, 80, 100];

const TONES: PriorityMatrixTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

const QUADRANT_NAMES: Record<string, string> = {
  'quick-wins': 'Gains rapides',
  'major-projects': 'Projets majeurs',
  wait: 'Attendre',
  drop: 'Ne pas faire',
};

function splitLabel(value: string): string[] {
  const chars = [...value];
  if (chars.length <= 12) return [value];
  const mid = Math.ceil(chars.length / 2);
  const space = value.lastIndexOf(' ', mid + 4);
  if (space > 2 && space < value.length - 2) return [value.slice(0, space), value.slice(space + 1)];
  return [value.slice(0, mid), value.slice(mid)];
}

/**
 * Fixed obstacles for the placement: keep-out bands around the two threshold
 * lines plus one rectangle per quadrant name, in frame pixels. Estimated from
 * the rendered geometry (11px names); a soft cost, not a hard exclusion.
 */
function buildMatrixObstacles(
  tx: number,
  ty: number,
  plotW: number,
  plotH: number,
): PriorityMatrixObstacle[] {
  const names: Array<{ x: number; y: number; anchor: 'start' | 'end'; text: string }> = [
    { x: MARGIN.left + 6, y: MARGIN.top + 14, anchor: 'start', text: QUADRANT_NAMES['quick-wins']! },
    { x: MARGIN.left + plotW - 6, y: MARGIN.top + 14, anchor: 'end', text: QUADRANT_NAMES['major-projects']! },
    { x: MARGIN.left + 6, y: MARGIN.top + plotH - 8, anchor: 'start', text: QUADRANT_NAMES.wait! },
    { x: MARGIN.left + plotW - 6, y: MARGIN.top + plotH - 8, anchor: 'end', text: QUADRANT_NAMES.drop! },
  ];
  const out: PriorityMatrixObstacle[] = [
    { x: tx - 3, y: MARGIN.top, w: 6, h: plotH },
    { x: MARGIN.left, y: ty - 3, w: plotW, h: 6 },
  ];
  for (const q of names) {
    const w = [...q.text].length * 6.5 + 4;
    out.push({ x: q.anchor === 'start' ? q.x : q.x - w, y: q.y - 9, w, h: 12 });
  }
  return out;
}

/** Accessible coordinate text; non-finite values read as N/A, never NaN. */
function coordText(v: number): string {
  return Number.isFinite(v) ? String(v) : 'N/A';
}

defineOptions({ name: 'PriorityMatrix', inheritAttrs: false });
const props = withDefaults(defineProps<PriorityMatrixProps>(), {
  title: 'Matrice de priorisation', xLabel: 'Complexité (0-100 pts)', yLabel: 'Valeur (0-100 pts)',
  xThreshold: 50, yThreshold: 50, width: 640, height: 400, radius: 5, class: undefined,
});

const width = computed(() => props.width ?? 640);
const height = computed(() => props.height ?? 400);
const radius = computed(() => props.radius ?? 5);
const xThreshold = computed(() => props.xThreshold ?? 50);
const yThreshold = computed(() => props.yThreshold ?? 50);
const plotW = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotH = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

function scaleX(v: number): number {
  return Number.isFinite(v) ? MARGIN.left + (Math.min(Math.max(v, 0), 100) / 100) * plotW.value : MARGIN.left;
}
function scaleY(v: number): number {
  return Number.isFinite(v) ? MARGIN.top + (1 - Math.min(Math.max(v, 0), 100) / 100) * plotH.value : MARGIN.top;
}
const tx = computed(() => scaleX(xThreshold.value));
const ty = computed(() => scaleY(yThreshold.value));

// Memoised: the annealing pass costs ~3ms at 13 points but ~37ms at 50,
// and must not rerun on every parent render.
const placedMemo = computed(() => {
  const widthV = width.value;
  const heightV = height.value;
  const data = props.data ?? [];
  const xThresholdV = xThreshold.value;
  const yThresholdV = yThreshold.value;
  const plotWV = plotW.value;
  const plotHV = plotH.value;
  const sx = (v: number) =>
    Number.isFinite(v) ? MARGIN.left + (Math.min(Math.max(v, 0), 100) / 100) * plotWV : MARGIN.left;
  const sy = (v: number) =>
    Number.isFinite(v) ? MARGIN.top + (1 - Math.min(Math.max(v, 0), 100) / 100) * plotHV : MARGIN.top;
  const boxes = data.map((d) => {
    const lines = splitLabel(d.label);
    const longest = Math.max(...lines.map((l) => [...l].length));
    return { w: Math.min(120, 12 + 7 * longest), h: lines.length > 1 ? 34 : 20, lines };
  });
  return placePriorityLabels(
    data.map((d) => ({ x: d.x, y: d.y, label: d.label })),
    boxes,
    { width: widthV, height: heightV, marginLeft: MARGIN.left, marginTop: MARGIN.top, plotWidth: plotWV, plotHeight: plotHV },
    { xThreshold: xThresholdV, yThreshold: yThresholdV, obstacles: buildMatrixObstacles(sx(xThresholdV), sy(yThresholdV), plotWV, plotHV) },
  ).map((p) => ({ ...p, lines: boxes[p.index]!.lines as string[] }));
});

const quads = computed(() => [
  { id: 'quick-wins', x: MARGIN.left, y: MARGIN.top, w: tx.value - MARGIN.left, h: ty.value - MARGIN.top },
  { id: 'major-projects', x: tx.value, y: MARGIN.top, w: MARGIN.left + plotW.value - tx.value, h: ty.value - MARGIN.top },
  { id: 'wait', x: MARGIN.left, y: ty.value, w: tx.value - MARGIN.left, h: MARGIN.top + plotH.value - ty.value },
  { id: 'drop', x: tx.value, y: ty.value, w: MARGIN.left + plotW.value - tx.value, h: MARGIN.top + plotH.value - ty.value },
]);
const quadNames = computed(() => [
  { id: 'quick-wins', x: MARGIN.left + 6, y: MARGIN.top + 14, anchor: 'start' },
  { id: 'major-projects', x: MARGIN.left + plotW.value - 6, y: MARGIN.top + 14, anchor: 'end' },
  { id: 'wait', x: MARGIN.left + 6, y: MARGIN.top + plotH.value - 8, anchor: 'start' },
  { id: 'drop', x: MARGIN.left + plotW.value - 6, y: MARGIN.top + plotH.value - 8, anchor: 'end' },
]);

const points = computed(() =>
  (props.data ?? []).map((d, i) => ({
    cx: scaleX(d.x),
    cy: scaleY(d.y),
    datum: d,
    index: i,
    tone: (d.tone ?? TONES[i % TONES.length]) as PriorityMatrixTone,
  })),
);

const dataValueItems = computed(() =>
  (props.data ?? []).map((d) => `${d.label} : complexité ${coordText(d.x)}, valeur ${coordText(d.y)}`),
);

const tickYs = computed(() => TICKS.map((t) => ({ t, y: scaleY(t) })));
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-priorityMatrix', props.class)) }" >
    <div class="st-priorityMatrix__visual" role="img" :aria-label="props.label">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <text v-if="props.title" class="st-priorityMatrix__title" :x="MARGIN.left" y="15" text-anchor="start">{{ props.title }}</text>
        <rect v-for="q in quads" :key="q.id" :class="`st-priorityMatrix__quad st-priorityMatrix__quad--${q.id}`" :x="q.x" :y="q.y" :width="q.w" :height="q.h" />
        <template v-for="entry in tickYs" :key="`gy${entry.t}`">
          <line class="st-priorityMatrix__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="entry.y" :y2="entry.y" />
          <text class="st-priorityMatrix__tick" :x="MARGIN.left - 6" :y="entry.y" text-anchor="end" dominant-baseline="middle">{{ String(entry.t) }}</text>
        </template>
        <text v-for="t in TICKS" :key="`tx${t}`" class="st-priorityMatrix__tick" :x="scaleX(t)" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ String(t) }}</text>
        <line class="st-priorityMatrix__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-priorityMatrix__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <line class="st-priorityMatrix__threshold" :x1="tx" :x2="tx" :y1="MARGIN.top" :y2="MARGIN.top + plotH" />
        <line class="st-priorityMatrix__threshold" :x1="MARGIN.left" :x2="MARGIN.left + plotW" :y1="ty" :y2="ty" />
        <text v-for="q in quadNames" :key="q.id" class="st-priorityMatrix__quadName" :x="q.x" :y="q.y" :text-anchor="q.anchor">{{ QUADRANT_NAMES[q.id]! }}</text>
        <text v-if="props.xLabel" class="st-priorityMatrix__axisLabel" :x="MARGIN.left + plotW / 2" :y="height - 4" text-anchor="middle">{{ props.xLabel }}</text>
        <text v-if="props.yLabel" class="st-priorityMatrix__axisLabel" x="12" :y="MARGIN.top + plotH / 2" text-anchor="middle" :transform="`rotate(-90 12 ${MARGIN.top + plotH / 2})`">{{ props.yLabel }}</text>
        <circle v-for="p in points" :key="`p${p.index}`" :class="`st-priorityMatrix__point st-priorityMatrix__point--${p.tone}`" :cx="p.cx" :cy="p.cy" :r="radius" />
        <template v-for="p in placedMemo" :key="`b${p.index}`">
          <line class="st-priorityMatrix__leader" :x1="p.leaderX1" :y1="p.leaderY1" :x2="p.leaderX2" :y2="p.leaderY2" />
          <rect class="st-priorityMatrix__labelBox" :x="p.x" :y="p.y" :width="p.w" :height="p.h" rx="3" />
          <text v-for="(line, li) in p.lines" :key="`t${p.index}-${li}`" class="st-priorityMatrix__labelText" :x="p.x + p.w / 2" :y="p.y + 13 + li * 13" text-anchor="middle">{{ line }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
  </div>
</template>
