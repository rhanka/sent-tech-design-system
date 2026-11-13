<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from './chartDataLabels.js';

export type StackedBarTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type StackedBarSegment = {
  label: string;
  value: number;
  tone?: StackedBarTone;
};

export type StackedBarDatum = {
  label: string;
  segments: StackedBarSegment[];
};

export type StackedBarChartProps = {
  data: StackedBarDatum[];
  width?: number;
  height?: number;
  label: string;
  showLegend?: boolean;
  dataLabels?: DataLabelsProp;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  class?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 34, left: 44 } as const;
const DATA_LABEL_MIN_SEG_PX = 14;

const TONES: StackedBarTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

defineOptions({ name: 'StackedBarChart', inheritAttrs: false });
const props = withDefaults(defineProps<StackedBarChartProps>(), {
  width: 480, height: 260, showLegend: true, dataLabels: undefined,
  hiddenSeries: undefined, onToggleSeries: undefined, class: undefined,
});

const hovered = ref<{ bar: number; seg: number } | null>(null);

function handleLeave() {
  hovered.value = null;
}
function handleVisualPointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hovered.value = null;
    return;
  }
  const bar = Number(target.getAttribute('data-bar-index'));
  const seg = Number(target.getAttribute('data-segment-index'));
  hovered.value = Number.isInteger(bar) && Number.isInteger(seg) ? { bar, seg } : null;
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 260);
const showLegend = computed(() => props.showLegend ?? true);
const label = computed(() => props.label);
const data = computed(() => props.data);

// Interactive legend is active as soon as the parent wires either prop.
const legendInteractive = computed(() => props.onToggleSeries !== undefined || props.hiddenSeries !== undefined);
const hiddenSet = computed(() => new Set(props.hiddenSeries ?? []));

const legend = computed(() => {
  const seen = new Map<string, StackedBarTone>();
  data.value.forEach((bar) =>
    bar.segments.forEach((seg, i) => {
      if (!seen.has(seg.label)) seen.set(seg.label, seg.tone ?? TONES[i % TONES.length]);
    }),
  );
  return [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));
});

const totals = computed(() =>
  data.value.map((b) =>
    b.segments.reduce((s, x) => (hiddenSet.value.has(x.label) ? s : s + Math.max(x.value, 0)), 0),
  ),
);
const ticks = computed(() => niceTicks(0, Math.max(0, ...totals.value)));
const domainMax = computed(() => ticks.value[ticks.value.length - 1]);
const plotW = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotH = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

type Seg = {
  x: number;
  y: number;
  width: number;
  height: number;
  seg: StackedBarSegment;
  tone: StackedBarTone;
  cx: number;
  cy: number;
};
type Bar = { x: number; band: number; label: string; segs: Seg[]; cxLabel: number };

const bars = computed<Bar[]>(() => {
  if (data.value.length === 0) return [];
  const band = plotW.value / data.value.length;
  const barWidth = band * 0.6;
  return data.value.map((bar, bi) => {
    const x = MARGIN.left + band * bi + (band - barWidth) / 2;
    let acc = 0;
    const segs = bar.segments
      .map((seg, si) => ({ seg, tone: seg.tone ?? TONES[si % TONES.length] }))
      .filter(({ seg }) => !hiddenSet.value.has(seg.label))
      .map(({ seg, tone }) => {
        const v = Math.max(seg.value, 0);
        const yTop = MARGIN.top + scaleLinear(acc + v, 0, domainMax.value, plotH.value, 0);
        const yBottom = MARGIN.top + scaleLinear(acc, 0, domainMax.value, plotH.value, 0);
        acc += v;
        return {
          x,
          y: yTop,
          width: barWidth,
          height: Math.max(yBottom - yTop, 0),
          seg,
          tone,
          cx: x + barWidth / 2,
          cy: yTop + (yBottom - yTop) / 2,
        };
      });
    return { x, band, label: bar.label, segs, cxLabel: MARGIN.left + band * (bi + 0.5) };
  });
});

const dataValueItems = computed(() =>
  data.value.flatMap((bar) =>
    bar.segments.filter((seg) => !hiddenSet.value.has(seg.label)).map((seg) => `${bar.label}, ${seg.label}: ${seg.value}`),
  ),
);

const dataLabelOpts = computed(() => normalizeDataLabels(props.dataLabels));
type DataLabelGeom = { key: string; x: number; y: number; text: string };
const dataLabelItems = computed<DataLabelGeom[]>(() => {
  const opts = dataLabelOpts.value;
  if (!opts.enabled) return [];
  return bars.value.flatMap((bar) =>
    bar.segs
      .filter((s) => s.height >= DATA_LABEL_MIN_SEG_PX)
      .map((s) => ({
        key: `${bar.label}-${s.seg.label}`,
        x: s.cx,
        y: s.cy,
        text: formatDataLabel(s.seg.value, opts, formatTick),
      })),
  );
});

const hoveredSeg = computed(() =>
  hovered.value ? bars.value[hovered.value.bar]?.segs[hovered.value.seg] : undefined,
);

function gridY(t: number): number {
  return MARGIN.top + scaleLinear(t, 0, domainMax.value, plotH.value, 0);
}
function isDim(bi: number, si: number): boolean {
  return hovered.value !== null && !(hovered.value.bar === bi && hovered.value.seg === si);
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-stackedBar', props.class)">
    <div
      class="st-stackedBar__visual"
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
        <template v-for="t in ticks" :key="t">
          <line class="st-stackedBar__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="gridY(t)" :y2="gridY(t)" />
          <text class="st-stackedBar__tick" :x="MARGIN.left - 6" :y="gridY(t)" text-anchor="end" dominant-baseline="middle">{{ formatTick(t) }}</text>
        </template>
        <line class="st-stackedBar__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-stackedBar__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <template v-for="(bar, bi) in bars" :key="bar.label">
          <text class="st-stackedBar__categoryLabel" :x="bar.cxLabel" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ bar.label }}</text>
          <rect
            v-for="(s, si) in bar.segs"
            :key="`seg${bar.label}-${s.seg.label}`"
            :class="classNames(
              'st-stackedBar__seg',
              `st-stackedBar__seg--${s.tone}`,
              isDim(bi, si) && 'st-stackedBar__seg--dim',
            )"
            :x="s.x"
            :y="s.y"
            :width="s.width"
            :height="s.height"
            :data-bar-index="bi"
            :data-segment-index="si"
          />
        </template>
        <g v-if="dataLabelItems.length > 0" class="st-stackedBar__dataLabels" aria-hidden="true">
          <text
            v-for="d in dataLabelItems"
            :key="`dl-${d.key}`"
            class="st-stackedBar__dataLabel"
            :x="d.x"
            :y="d.y"
            text-anchor="middle"
            dominant-baseline="central"
          >{{ d.text }}</text>
        </g>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredSeg"
      class="st-stackedBar__tooltip"
      role="presentation"
      :style="`left: ${(hoveredSeg.cx / width) * 100}%; top: ${(hoveredSeg.cy / height) * 100}%`"
    >
      <span class="st-stackedBar__tooltipLabel">{{ hoveredSeg.seg.label }}</span>
      <span class="st-stackedBar__tooltipValue">{{ String(hoveredSeg.seg.value) }}</span>
    </div>
    <ul v-if="showLegend && legend.length > 0" class="st-stackedBar__legend">
      <li
        v-for="item in legend"
        :key="item.seriesLabel"
        :class="classNames(
          'st-stackedBar__legendItem',
          legendInteractive && hiddenSet.has(item.seriesLabel) && 'st-stackedBar__legendItem--off',
        )"
      >
        <button
          v-if="legendInteractive"
          type="button"
          class="st-stackedBar__legendButton"
          :aria-pressed="hiddenSet.has(item.seriesLabel) ? 'true' : 'false'"
          @click="() => props.onToggleSeries?.(item.seriesLabel)"
        >
          <span :class="classNames('st-stackedBar__legendSwatch', `st-stackedBar__legendSwatch--${item.tone}`)" aria-hidden="true" />{{ ` ${item.seriesLabel}` }}
        </button>
        <template v-else>
          <span :class="classNames('st-stackedBar__legendSwatch', `st-stackedBar__legendSwatch--${item.tone}`)" aria-hidden="true" />{{ item.seriesLabel }}
        </template>
      </li>
    </ul>
  </div>
</template>
