<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { buildLinearPath, buildSmoothPath, scaleLinear } from './chartScale.js';

export type StreamgraphChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type StreamgraphChartSeriesValue = {
  label: string;
  value: number;
  tone?: StreamgraphChartTone;
};

export type StreamgraphChartDatum = {
  category: string;
  values: StreamgraphChartSeriesValue[];
};

export type StreamgraphChartProps = {
  data: StreamgraphChartDatum[];
  width?: number;
  height?: number;
  label: string;
  smooth?: boolean;
  showLegend?: boolean;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 16 } as const;

const TONES: StreamgraphChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

// Valeur non-finie ou négative → 0 (le streamgraph empile des grandeurs ≥ 0).
const safeValue = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

defineOptions({ name: 'StreamgraphChart', inheritAttrs: false });
const props = withDefaults(defineProps<StreamgraphChartProps>(), {
  data: () => [], width: 480, height: 240, smooth: true, showLegend: true, class: undefined,
});

const hovered = ref<number | null>(null);

function handleLeave() {
  hovered.value = null;
}
function handleVisualPointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hovered.value = null;
    return;
  }
  const si = Number(target.getAttribute('data-series-index'));
  hovered.value = Number.isInteger(si) ? si : null;
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);
const smooth = computed(() => props.smooth ?? true);
const showLegend = computed(() => props.showLegend ?? true);
const label = computed(() => props.label);
const data = computed(() => props.data ?? []);

const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

const series = computed(() => {
  const seen = new Map<string, StreamgraphChartTone>();
  data.value.forEach((d) =>
    d.values.forEach((sv) => {
      if (!seen.has(sv.label)) seen.set(sv.label, sv.tone ?? TONES[seen.size % TONES.length]);
    }),
  );
  return [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));
});

const halfMaxRaw = computed(() => {
  let half = 0;
  for (const d of data.value) {
    let sum = 0;
    for (const sv of d.values) sum += safeValue(sv.value);
    if (sum > half) half = sum;
  }
  return half;
});
const halfMax = computed(() => halfMaxRaw.value / 2 || 1);

const n = computed(() => data.value.length);
const xs = computed(() =>
  data.value.map((_, i) => {
    const denom = Math.max(n.value - 1, 1);
    const xRatio = n.value === 1 ? 0.5 : i / denom;
    return MARGIN.left + xRatio * plotWidth.value;
  }),
);
const midY = computed(() => MARGIN.top + plotHeight.value / 2);
function valToY(signed: number): number {
  return midY.value - scaleLinear(signed, 0, halfMax.value, 0, plotHeight.value / 2);
}

type BandPoint = { x: number; top: number; bottom: number };
const bands = computed<BandPoint[][]>(() => {
  const result: BandPoint[][] = series.value.map(() => []);
  data.value.forEach((d, xi) => {
    const total = d.values.reduce((s, sv) => s + safeValue(sv.value), 0);
    let acc = -total / 2;
    series.value.forEach((s, si) => {
      const sv = d.values.find((v) => v.label === s.seriesLabel);
      const v = sv ? safeValue(sv.value) : 0;
      const lower = acc;
      const upper = acc + v;
      acc = upper;
      result[si].push({ x: xs.value[xi], top: valToY(upper), bottom: valToY(lower) });
    });
  });
  return result;
});

type AreaGeom = { tone: StreamgraphChartTone; seriesLabel: string; d: string };
const areas = computed<AreaGeom[]>(() =>
  series.value.map((s, si) => {
    const band = bands.value[si];
    if (!band || band.length === 0) return { tone: s.tone, seriesLabel: s.seriesLabel, d: '' };
    const topPts = band.map((b) => ({ x: b.x, y: b.top }));
    const bottomPts = band.map((b) => ({ x: b.x, y: b.bottom })).reverse();
    const topPath = smooth.value ? buildSmoothPath(topPts) : buildLinearPath(topPts);
    const bottomPath = (smooth.value ? buildSmoothPath(bottomPts) : buildLinearPath(bottomPts)).replace(/^M/, 'L');
    return { tone: s.tone, seriesLabel: s.seriesLabel, d: `${topPath} ${bottomPath} Z` };
  }),
);

const xTickEntries = computed<{ x: number; label: string }[]>(() => {
  if (n.value === 0) return [];
  const result: { x: number; label: string }[] = [];
  const target = Math.min(5, n.value);
  const stride = Math.max(1, Math.round((n.value - 1) / (target - 1 || 1)));
  for (let i = 0; i < n.value; i += stride) result.push({ x: xs.value[i], label: data.value[i].category });
  const lastIdx = n.value - 1;
  if (result[result.length - 1]?.label !== data.value[lastIdx].category) {
    result.push({ x: xs.value[lastIdx], label: data.value[lastIdx].category });
  }
  return result;
});

const dataValueItems = computed(() => {
  const items = series.value.map((s) => {
    const total = data.value.reduce((sum, d) => {
      const sv = d.values.find((v) => v.label === s.seriesLabel);
      return sum + (sv ? safeValue(sv.value) : 0);
    }, 0);
    return `${s.seriesLabel}: ${total}`;
  });
  const grand = data.value.reduce((sum, d) => sum + d.values.reduce((s, sv) => s + safeValue(sv.value), 0), 0);
  if (series.value.length > 0) items.push(`Total: ${grand}`);
  return items;
});

type TooltipGeom = { label: string; value: number; cx: number; cy: number } | null;
const tooltip = computed<TooltipGeom>(() => {
  if (hovered.value === null || !series.value[hovered.value]) return null;
  const s = series.value[hovered.value];
  const band = bands.value[hovered.value];
  if (!band || band.length === 0) return null;
  const mid = band[Math.floor(band.length / 2)];
  const total = data.value.reduce((sum, d) => {
    const sv = d.values.find((v) => v.label === s.seriesLabel);
    return sum + (sv ? safeValue(sv.value) : 0);
  }, 0);
  return { label: s.seriesLabel, value: total, cx: mid.x, cy: (mid.top + mid.bottom) / 2 };
});

function isDim(si: number): boolean {
  return hovered.value !== null && hovered.value !== si;
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-streamgraphChart', props.class)">
    <div
      class="st-streamgraphChart__visual"
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
        <line
          class="st-streamgraphChart__axis"
          :x1="MARGIN.left"
          :x2="width - MARGIN.right"
          :y1="height - MARGIN.bottom"
          :y2="height - MARGIN.bottom"
        />
        <text
          v-for="(tick, i) in xTickEntries"
          :key="`x${i}`"
          class="st-streamgraphChart__tickLabel"
          :x="tick.x"
          :y="height - MARGIN.bottom + 16"
          text-anchor="middle"
        >{{ tick.label }}</text>
        <template v-for="(area, si) in areas" :key="area.seriesLabel">
          <path
            v-if="area.d"
            :class="classNames(
              'st-streamgraphChart__area',
              `st-streamgraphChart__area--${area.tone}`,
              isDim(si) && 'st-streamgraphChart__area--dim',
            )"
            :d="area.d"
            :data-series-index="si"
          />
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="tooltip"
      class="st-streamgraphChart__tooltip"
      role="presentation"
      :style="`left: ${(tooltip.cx / width) * 100}%; top: ${(tooltip.cy / height) * 100}%`"
    >
      <span class="st-streamgraphChart__tooltipLabel">{{ tooltip.label }}</span>
      <span class="st-streamgraphChart__tooltipValue">{{ String(tooltip.value) }}</span>
    </div>
    <ul v-if="showLegend && series.length > 0" class="st-streamgraphChart__legend">
      <li v-for="item in series" :key="item.seriesLabel" class="st-streamgraphChart__legendItem">
        <span :class="classNames('st-streamgraphChart__legendSwatch', `st-streamgraphChart__legendSwatch--${item.tone}`)" aria-hidden="true" />{{ item.seriesLabel }}
      </li>
    </ul>
  </div>
</template>
