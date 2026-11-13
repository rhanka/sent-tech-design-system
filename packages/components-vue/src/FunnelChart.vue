<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { labelColorForTone } from './chartScale.js';

export type FunnelChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type FunnelChartDatum = {
  label: string;
  value: number;
  tone?: FunnelChartTone;
};

export type FunnelChartProps = {
  data: FunnelChartDatum[];
  orientation?: 'vertical' | 'horizontal';
  showPercentages?: boolean;
  percentMode?: 'ofFirst' | 'ofPrevious';
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const GAP = 6;
const TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

defineOptions({ name: 'FunnelChart', inheritAttrs: false });
const props = withDefaults(defineProps<FunnelChartProps>(), {
  orientation: 'vertical', showPercentages: true, percentMode: 'ofFirst', legend: false,
  width: 480, height: 280, class: undefined,
});

/**
 * Magnitude normalisée d'une étape : un entonnoir ne représente que des
 * grandeurs positives. Les valeurs non finies ou négatives sont ramenées à 0.
 */
function magnitude(v: number): number {
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function formatPercent(p: number): string {
  if (!Number.isFinite(p)) return '0%';
  return `${p % 1 === 0 ? p.toFixed(0) : p.toFixed(1)}%`;
}

type Segment = {
  points: string;
  datum: FunnelChartDatum;
  tone: string;
  textColor: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  percent: number;
};

const segments = computed<Segment[]>(() => {
  const data = props.data ?? [];
  const width = props.width ?? 480;
  const height = props.height ?? 280;
  const percentMode = props.percentMode ?? 'ofFirst';
  const orientation = props.orientation ?? 'vertical';
  const first = magnitude(data[0]?.value ?? 0);
  const percents = data.map((d, i) => {
    const value = magnitude(d.value);
    const ref0 = percentMode === 'ofPrevious' ? magnitude(data[i - 1]?.value ?? d.value) : first;
    return ref0 === 0 ? 0 : (value / ref0) * 100;
  });
  if (data.length === 0) return [];
  const maxValue = Math.max(0, ...data.map((d) => magnitude(d.value)));
  const safeMax = maxValue === 0 ? 1 : maxValue;
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  if (orientation === 'vertical') {
    const band = plotH / data.length;
    const segH = Math.max(band - GAP, 1);
    const cx = MARGIN.left + plotW / 2;
    return data.map((d, i) => {
      const tone = d.tone ?? TONES[i % TONES.length];
      const topHalf = (magnitude(d.value) / safeMax) * (plotW / 2);
      const nextVal = data[i + 1] ? magnitude(data[i + 1].value) : magnitude(d.value);
      const botHalf = Math.min((nextVal / safeMax) * (plotW / 2), topHalf);
      const y0 = MARGIN.top + band * i;
      const y1 = y0 + segH;
      const points = [
        `${cx - topHalf},${y0}`,
        `${cx + topHalf},${y0}`,
        `${cx + botHalf},${y1}`,
        `${cx - botHalf},${y1}`,
      ].join(' ');
      return {
        points,
        datum: d,
        tone,
        textColor: labelColorForTone(tone),
        cx,
        cy: (y0 + y1) / 2,
        labelX: cx,
        labelY: (y0 + y1) / 2,
        percent: percents[i],
      };
    });
  }
  const band = plotW / data.length;
  const segW = Math.max(band - GAP, 1);
  const cy = MARGIN.top + plotH / 2;
  return data.map((d, i) => {
    const tone = d.tone ?? TONES[i % TONES.length];
    const leftHalf = (magnitude(d.value) / safeMax) * (plotH / 2);
    const nextVal = data[i + 1] ? magnitude(data[i + 1].value) : magnitude(d.value);
    const rightHalf = Math.min((nextVal / safeMax) * (plotH / 2), leftHalf);
    const x0 = MARGIN.left + band * i;
    const x1 = x0 + segW;
    const points = [
      `${x0},${cy - leftHalf}`,
      `${x1},${cy - rightHalf}`,
      `${x1},${cy + rightHalf}`,
      `${x0},${cy + leftHalf}`,
    ].join(' ');
    return {
      points,
      datum: d,
      tone,
      textColor: labelColorForTone(tone),
      cx: (x0 + x1) / 2,
      cy,
      labelX: (x0 + x1) / 2,
      labelY: cy,
      percent: percents[i],
    };
  });
});

const dataValueItems = computed(() => {
  const data = props.data ?? [];
  const showPercentages = props.showPercentages ?? true;
  const percentMode = props.percentMode ?? 'ofFirst';
  const first = magnitude(data[0]?.value ?? 0);
  const percents = data.map((d, i) => {
    const value = magnitude(d.value);
    const ref0 = percentMode === 'ofPrevious' ? magnitude(data[i - 1]?.value ?? d.value) : first;
    return ref0 === 0 ? 0 : (value / ref0) * 100;
  });
  return data.map((d, i) =>
    showPercentages ? `${d.label}: ${d.value} (${formatPercent(percents[i])})` : `${d.label}: ${d.value}`,
  );
});

const legendItems = computed(() => {
  const data = props.data ?? [];
  return data.map((d, i) => ({ label: d.label, tone: d.tone ?? TONES[i % TONES.length] }));
});

const hoveredIndex = ref<number | null>(null);
const hoveredSegment = computed<Segment | undefined>(() => {
  const idx = hoveredIndex.value;
  if (idx === null) return undefined;
  return segments.value[idx];
});

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
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-funnelChart', props.class)">
    <div class="st-funnelChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${props.width ?? 480} ${props.height ?? 280}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <polygon v-for="(seg, i) in segments" :key="`p${seg.datum.label}`" :class="classNames('st-funnelChart__segment', `st-funnelChart__segment--${seg.tone}`, hoveredIndex !== null && hoveredIndex !== i && 'st-funnelChart__segment--dim')" :points="seg.points" :data-chart-index="i" />
        <template v-for="seg in segments" :key="`t${seg.datum.label}`">
          <text class="st-funnelChart__label" :x="seg.labelX" :y="seg.labelY - 6" text-anchor="middle" dominant-baseline="middle" :style="`fill: ${seg.textColor}`">{{ seg.datum.label }}</text>
          <text class="st-funnelChart__value" :x="seg.labelX" :y="seg.labelY + 8" text-anchor="middle" dominant-baseline="middle" :style="`fill: ${seg.textColor}`">{{ props.showPercentages ? `${seg.datum.value} · ${formatPercent(seg.percent)}` : String(seg.datum.value) }}</text>
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredSegment" class="st-funnelChart__tooltip" role="presentation" :style="`left: ${(hoveredSegment.cx / (props.width ?? 480)) * 100}%; top: ${(hoveredSegment.cy / (props.height ?? 280)) * 100}%`">
      <span class="st-funnelChart__tooltipLabel">{{ hoveredSegment.datum.label }}</span><span class="st-funnelChart__tooltipValue">{{ props.showPercentages ? `${hoveredSegment.datum.value} · ${formatPercent(hoveredSegment.percent)}` : String(hoveredSegment.datum.value) }}</span>
    </div>
    <ul v-if="props.legend && legendItems.length > 0" class="st-funnelChart__legend" aria-hidden="true">
      <li v-for="item in legendItems" :key="item.label" class="st-funnelChart__legendItem"><span :class="`st-funnelChart__legendSwatch st-funnelChart__legendSwatch--${item.tone}`" aria-hidden="true"></span> {{ item.label }}</li>
    </ul>
  </div>
</template>
