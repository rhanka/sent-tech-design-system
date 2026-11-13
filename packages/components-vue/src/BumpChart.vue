<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type BumpChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type BumpChartSeries = {
  label: string;
  ranks: (number | null | undefined)[];
  tone?: BumpChartTone;
};

export type BumpChartProps = {
  data: BumpChartSeries[];
  categories: string[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const TONES: BumpChartTone[] = [
  'category1', 'category2', 'category3', 'category4',
  'category5', 'category6', 'category7', 'category8',
];

const MARGIN = { top: 16, right: 80, bottom: 32, left: 80 };

// Valid rank = integer ≥1 only
function isValidRank(r: unknown): r is number {
  return (
    typeof r === 'number' &&
    Number.isFinite(r) &&
    Number.isInteger(r) &&
    r >= 1
  );
}

/**
 * Builds an SVG bump path with GAP for invalid ranks.
 * Uses cubic bezier curves for smooth bumps.
 */
function buildBumpPath(points: ({ x: number; y: number } | null)[]): string {
  const parts: string[] = [];
  let segment: { x: number; y: number }[] = [];

  function flushSegment() {
    if (segment.length >= 2) {
      let d = `M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`;
      for (let i = 0; i < segment.length - 1; i++) {
        const p1 = segment[i];
        const p2 = segment[i + 1];
        const mx = (p1.x + p2.x) / 2;
        d += ` C${mx.toFixed(2)},${p1.y.toFixed(2)} ${mx.toFixed(2)},${p2.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
      }
      parts.push(d);
    } else if (segment.length === 1) {
      parts.push(`M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`);
    }
    segment = [];
  }

  for (const pt of points) {
    if (pt === null) {
      flushSegment();
    } else {
      segment.push(pt);
    }
  }
  flushSegment();
  return parts.join(' ');
}

defineOptions({ name: 'BumpChart', inheritAttrs: false });
const props = withDefaults(defineProps<BumpChartProps>(), {
  data: () => [],
  categories: () => [],
  width: 480,
  height: 300,
  class: undefined,
});

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

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 300);

const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

const maxRank = computed(() => {
  let max = 1;
  for (const s of props.data ?? []) {
    for (const r of s.ranks) {
      if (isValidRank(r) && r > max) max = r;
    }
  }
  return max;
});

// Align ranks and categories using Math.min(ranks.length, categories.length)
const catCount = computed(() => Math.max((props.categories ?? []).length, 2));

function rankToY(rank: number): number {
  // rank 1 = top
  return MARGIN.top + ((rank - 1) / Math.max(maxRank.value - 1, 1)) * plotHeight.value;
}

function catToX(ci: number): number {
  return MARGIN.left + (ci / Math.max(catCount.value - 1, 1)) * plotWidth.value;
}

type SeriesEntry = {
  label: string;
  ranks: (number | null | undefined)[];
  tone: BumpChartTone;
  points: ({ x: number; y: number } | null)[];
  dots: { x: number; y: number; ci: number }[];
  endLabel: { x: number; y: number } | null;
  startLabel: { x: number; y: number } | null;
  index: number;
  path: string;
  alignedLength: number;
};

const seriesList = computed<SeriesEntry[]>(() => {
  const categories = props.categories ?? [];
  return (props.data ?? []).map((s, si) => {
    const tone = s.tone ?? TONES[si % TONES.length];
    // Align ranks/categories; invalid rank → null (GAP)
    const alignedLength = Math.min(s.ranks.length, categories.length);
    const points: ({ x: number; y: number } | null)[] = [];
    for (let ci = 0; ci < alignedLength; ci++) {
      const r = s.ranks[ci];
      if (isValidRank(r)) {
        points.push({ x: catToX(ci), y: rankToY(r) });
      } else {
        points.push(null); // GAP
      }
    }
    const dots: { x: number; y: number; ci: number }[] = [];
    points.forEach((pt, ci) => {
      if (pt !== null) dots.push({ x: pt.x, y: pt.y, ci });
    });
    const valid = points.filter((p): p is { x: number; y: number } => p !== null);
    return {
      label: s.label,
      ranks: s.ranks,
      tone,
      points,
      dots,
      endLabel: valid.length > 0 ? valid[valid.length - 1] : null,
      startLabel: valid.length > 1 ? valid[0] : null,
      index: si,
      path: buildBumpPath(points),
      alignedLength,
    };
  });
});

const rankTicks = computed(() => {
  const ticks: number[] = [];
  for (let r = 1; r <= maxRank.value; r++) ticks.push(r);
  return ticks;
});

// SR does not announce #1 for absent rank (uses "?" instead)
const dataValueItems = computed(() => {
  const categories = props.categories ?? [];
  return (props.data ?? []).map((s) => {
    const alignedLength = Math.min(s.ranks.length, categories.length);
    return (
      `${s.label}: ` +
      categories.slice(0, alignedLength).map((cat, ci) => {
        const r = s.ranks[ci];
        return `${cat} ${isValidRank(r) ? `#${r}` : '?'}`;
      }).join(', ')
    );
  });
});
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-bumpChart', props.class)) }" >
    <div
      class="st-bumpChart__visual"
      role="img"
      :aria-label="props.label"
      @pointermove="handlePointerMove"
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
        <template v-for="rank in rankTicks" :key="`rg${rank}`">
          <line class="st-bumpChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="rankToY(rank)" :y2="rankToY(rank)" />
          <text class="st-bumpChart__rankLabel" :x="MARGIN.left - 8" :y="rankToY(rank)" text-anchor="end" dominant-baseline="middle">{{ `#${rank}` }}</text>
        </template>
        <text
          v-for="(cat, ci) in props.categories ?? []"
          :key="`cat${cat}`"
          class="st-bumpChart__catLabel"
          :x="catToX(ci)"
          :y="height - MARGIN.bottom + 16"
          text-anchor="middle"
        >{{ cat }}</text>
        <template v-for="s in seriesList" :key="`line${s.index}-${s.label}`">
          <path
            :class="classNames(
              'st-bumpChart__line',
              `st-bumpChart__line--${s.tone}`,
              hoveredIndex !== null && hoveredIndex !== s.index ? 'st-bumpChart__line--dim' : undefined,
              hoveredIndex === s.index ? 'st-bumpChart__line--active' : undefined,
            )"
            :d="s.path"
            fill="none"
            :data-chart-index="s.index"
          />
          <circle
            v-for="dot in s.dots"
            :key="`dot${s.index}-${s.label}-${dot.ci}`"
            :class="classNames(
              'st-bumpChart__dot',
              `st-bumpChart__dot--${s.tone}`,
              hoveredIndex !== null && hoveredIndex !== s.index ? 'st-bumpChart__dot--dim' : undefined,
            )"
            :cx="dot.x" :cy="dot.y" r="4"
            :data-chart-index="s.index"
          />
          <text v-if="s.endLabel" class="st-bumpChart__seriesLabel" :x="s.endLabel.x + 8" :y="s.endLabel.y" dominant-baseline="middle">{{ s.label }}</text>
          <text v-if="s.startLabel" class="st-bumpChart__seriesLabel" :x="s.startLabel.x - 8" :y="s.startLabel.y" text-anchor="end" dominant-baseline="middle">{{ s.label }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
  </div>
</template>
