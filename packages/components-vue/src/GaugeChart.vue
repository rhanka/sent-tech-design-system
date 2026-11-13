<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type GaugeChartTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type GaugeChartThreshold = {
  value: number;
  tone: GaugeChartTone;
};

export type GaugeChartFormat = 'number' | 'percent';

export type GaugeChartProps = {
  value: number;
  min?: number;
  max?: number;
  thresholds?: GaugeChartThreshold[];
  label?: string;
  format?: GaugeChartFormat;
  unit?: string;
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  class?: string;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

const polar = (
  radius: number,
  angle: number,
  centerX: number,
  centerY: number,
): [number, number] => [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];

defineOptions({ name: 'GaugeChart', inheritAttrs: false });
const props = withDefaults(defineProps<GaugeChartProps>(), {
  min: 0, max: 100, thresholds: undefined, label: undefined, format: 'number', unit: undefined,
  size: 220, thickness: 22, startAngle: 180, endAngle: 360, class: undefined,
});

const span = computed(() => Math.max((props.max ?? 100) - (props.min ?? 0), 0));
const clamped = computed(() => Math.min(Math.max(props.value, props.min ?? 0), props.max ?? 100));
const frac = computed(() => (span.value > 0 ? (clamped.value - (props.min ?? 0)) / span.value : 0));

const geometry = computed(() => {
  const size = props.size ?? 220;
  const thickness = props.thickness ?? 22;
  const startAngle = props.startAngle ?? 180;
  const endAngle = props.endAngle ?? 360;
  const cx = size / 2;
  const r = size / 2 - thickness / 2 - 2;
  const a0 = toRad(startAngle);
  const a1 = toRad(endAngle);
  const totalAngle = a1 - a0;
  const cyRaw = size / 2;
  const samples = 64;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const a = a0 + (totalAngle * i) / samples;
    const yOuter = cyRaw + (r + thickness / 2) * Math.sin(a);
    minY = Math.min(minY, yOuter);
    maxY = Math.max(maxY, yOuter);
  }
  minY = Math.min(minY, cyRaw - (r + thickness / 2));
  const vbHeightRaw = Math.min(maxY, size) - Math.max(minY, 0);
  return { cx, cy: cyRaw, r, a0, totalAngle, thickness, size, vbTop: Math.max(minY, 0), vbHeight: Math.max(vbHeightRaw, thickness) };
});

function arcPath(fromFrac: number, toFrac: number): string {
  const { cx, cy, r, a0, totalAngle } = geometry.value;
  const from = a0 + totalAngle * fromFrac;
  const to = a0 + totalAngle * toFrac;
  const [x0, y0] = polar(r, from, cx, cy);
  const [x1, y1] = polar(r, to, cx, cy);
  const large = Math.abs(to - from) > Math.PI ? 1 : 0;
  const sweep = totalAngle >= 0 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
}

type Band = { from: number; to: number; tone: GaugeChartTone };

const bands = computed<Band[]>(() => {
  const thresholds = props.thresholds;
  if (!thresholds || thresholds.length === 0 || span.value <= 0) return [];
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const sorted = [...thresholds].sort((a, b) => a.value - b.value);
  const segments: Band[] = [];
  let start = min;
  for (const t of sorted) {
    const end = Math.min(Math.max(t.value, min), max);
    if (end <= start) continue;
    segments.push({ from: (start - min) / span.value, to: (end - min) / span.value, tone: t.tone });
    start = end;
  }
  if (start < max) {
    const lastTone = sorted[sorted.length - 1]?.tone ?? 'neutral';
    segments.push({ from: (start - min) / span.value, to: 1, tone: lastTone });
  }
  return segments;
});

const needle = computed(() => {
  const { cx, cy, r, a0, totalAngle, thickness } = geometry.value;
  const needleAngle = a0 + totalAngle * frac.value;
  const tip = polar(r + thickness / 2, needleAngle, cx, cy);
  const leftPt = polar(thickness * 0.18, needleAngle + Math.PI / 2, cx, cy);
  const rightPt = polar(thickness * 0.18, needleAngle - Math.PI / 2, cx, cy);
  return `M ${leftPt[0]} ${leftPt[1]} L ${tip[0]} ${tip[1]} L ${rightPt[0]} ${rightPt[1]} Z`;
});

const formatted = computed(() => {
  const format = props.format ?? 'number';
  if (format === 'percent') {
    const pct = span.value > 0 ? Math.round(frac.value * 100) : 0;
    return `${pct}%`;
  }
  const num = Number.isInteger(clamped.value) ? String(clamped.value) : clamped.value.toFixed(1);
  return props.unit ? `${num} ${props.unit}` : num;
});

const ariaValueText = computed(() => {
  let activeBandLabel: string | undefined;
  if (bands.value.length > 0) {
    const activeBand = bands.value.find((b) => b.to >= frac.value && b.from <= frac.value) ?? bands.value[bands.value.length - 1];
    if (activeBand) activeBandLabel = activeBand.tone;
  }
  const label = props.label;
  return [label ? `${label}: ${formatted.value}` : formatted.value, activeBandLabel ? `zone ${activeBandLabel}` : undefined]
    .filter(Boolean)
    .join(', ');
});

const dataValueItems = computed(() => {
  const label = props.label;
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  return [`${label ? `${label}: ` : ''}${formatted.value} (min ${min}, max ${max})`];
});
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-gaugeChart', props.class)) }" >
    <div class="st-gaugeChart__visual" role="meter" :aria-valuenow="clamped" :aria-valuemin="props.min ?? 0" :aria-valuemax="props.max ?? 100" :aria-valuetext="ariaValueText" :aria-label="props.label">
      <svg :viewBox="`0 ${geometry.vbTop} ${geometry.size} ${geometry.vbHeight}`" width="100%" height="100%" focusable="false" aria-hidden="true">
        <path class="st-gaugeChart__track" :d="arcPath(0, 1)" fill="none" :stroke-width="geometry.thickness" />
        <path v-for="(band, i) in bands" :key="`band${i}`" :class="`st-gaugeChart__band st-gaugeChart__band--${band.tone}`" :d="arcPath(band.from, band.to)" fill="none" :stroke-width="geometry.thickness" />
        <path v-if="bands.length === 0" class="st-gaugeChart__progress" :d="arcPath(0, frac)" fill="none" :stroke-width="geometry.thickness" />
        <path class="st-gaugeChart__needle" :d="needle" />
        <circle class="st-gaugeChart__hub" :cx="geometry.cx" :cy="geometry.cy" :r="Math.max(geometry.thickness * 0.22, 4)" />
        <text class="st-gaugeChart__value" :x="geometry.cx" :y="geometry.cy - geometry.thickness * 0.55" text-anchor="middle" dominant-baseline="auto">{{ formatted }}</text>
        <text v-if="props.label" class="st-gaugeChart__label" :x="geometry.cx" :y="geometry.cy - geometry.thickness * 0.05" text-anchor="middle" dominant-baseline="hanging">{{ props.label }}</text>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label ?? 'gauge'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
  </div>
</template>
