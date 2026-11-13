<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type SolidGaugeTone =
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

export type SolidGaugeThreshold = {
  value: number;
  tone: SolidGaugeTone;
};

export type SolidGaugeFormat = 'number' | 'percent';

export type SolidGaugeChartProps = {
  value: number;
  min?: number;
  max?: number;
  thresholds?: SolidGaugeThreshold[];
  innerRadius?: number;
  label?: string;
  format?: SolidGaugeFormat;
  unit?: string;
  size?: number;
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

defineOptions({ name: 'SolidGaugeChart', inheritAttrs: false });
const props = withDefaults(defineProps<SolidGaugeChartProps>(), {
  min: 0, max: 100, thresholds: undefined, innerRadius: 0.72, label: undefined,
  format: 'number', unit: undefined, size: 220, startAngle: 180, endAngle: 360, class: undefined,
});

const value = computed(() => props.value);
const min = computed(() => props.min ?? 0);
const max = computed(() => props.max ?? 100);
const thresholds = computed(() => props.thresholds);
const innerRadius = computed(() => props.innerRadius ?? 0.72);
const label = computed(() => props.label);
const format = computed(() => props.format ?? 'number');
const unit = computed(() => props.unit);
const size = computed(() => props.size ?? 220);
const startAngle = computed(() => props.startAngle ?? 180);
const endAngle = computed(() => props.endAngle ?? 360);

const span = computed(() => Math.max(max.value - min.value, 0));
const clamped = computed(() => Math.min(Math.max(value.value, min.value), max.value));
const frac = computed(() => (span.value > 0 ? (clamped.value - min.value) / span.value : 0));

const cx = computed(() => size.value / 2);
const r = computed(() => size.value / 2 - 2);
const innerR = computed(() => Math.min(Math.max(innerRadius.value, 0), 0.95) * r.value);
const thickness = computed(() => Math.max(r.value - innerR.value, 1));
const trackR = computed(() => (r.value + innerR.value) / 2);
const a0 = computed(() => toRad(startAngle.value));
const a1 = computed(() => toRad(endAngle.value));
const totalAngle = computed(() => a1.value - a0.value);

const geometry = computed(() => {
  const cyRaw = size.value / 2;
  const samples = 64;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const a = a0.value + (totalAngle.value * i) / samples;
    const yOuter = cyRaw + r.value * Math.sin(a);
    minY = Math.min(minY, yOuter);
    maxY = Math.max(maxY, yOuter);
  }
  minY = Math.min(minY, cyRaw - r.value);
  const vbHeightRaw = Math.min(maxY, size.value) - Math.max(minY, 0);
  return { cy: cyRaw, vbTop: Math.max(minY, 0), vbHeight: Math.max(vbHeightRaw, thickness.value) };
});
const cy = computed(() => geometry.value.cy);

function arcPath(fromFrac: number, toFrac: number): string {
  const from = a0.value + totalAngle.value * fromFrac;
  const to = a0.value + totalAngle.value * toFrac;
  const [x0, y0] = polar(trackR.value, from, cx.value, cy.value);
  const [x1, y1] = polar(trackR.value, to, cx.value, cy.value);
  const large = Math.abs(to - from) > Math.PI ? 1 : 0;
  const sweep = totalAngle.value >= 0 ? 1 : 0;
  return `M ${x0} ${y0} A ${trackR.value} ${trackR.value} 0 ${large} ${sweep} ${x1} ${y1}`;
}

const sortedThresholds = computed<SolidGaugeThreshold[]>(() =>
  thresholds.value && thresholds.value.length > 0 && span.value > 0
    ? [...thresholds.value].sort((a, b) => a.value - b.value)
    : [],
);

const activeTone = computed<SolidGaugeTone | null>(() => {
  if (sortedThresholds.value.length === 0) return null;
  let tone: SolidGaugeTone | null = sortedThresholds.value[0].tone;
  for (const t of sortedThresholds.value) {
    if (clamped.value >= t.value) tone = t.tone;
  }
  return tone;
});

const formatted = computed(() => {
  if (format.value === 'percent') {
    const pct = span.value > 0 ? Math.round(frac.value * 100) : 0;
    return `${pct}%`;
  }
  const num = Number.isInteger(clamped.value) ? String(clamped.value) : clamped.value.toFixed(1);
  return unit.value ? `${num} ${unit.value}` : num;
});

const ariaValueText = computed(() => (label.value ? `${label.value}: ${formatted.value}` : formatted.value));
const dataValueItems = computed(() => [`${label.value ? `${label.value}: ` : ''}${formatted.value} (min ${min.value}, max ${max.value})`]);
const progressClass = computed(() =>
  activeTone.value
    ? `st-solidGaugeChart__progress st-solidGaugeChart__progress--${activeTone.value}`
    : 'st-solidGaugeChart__progress',
);
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-solidGaugeChart', props.class)">
    <div
      class="st-solidGaugeChart__visual"
      role="meter"
      :aria-valuenow="clamped"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuetext="ariaValueText"
      :aria-label="label"
    >
      <svg
        :viewBox="`0 ${geometry.vbTop} ${size} ${geometry.vbHeight}`"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <path class="st-solidGaugeChart__track" :d="arcPath(0, 1)" fill="none" :stroke-width="thickness" />
        <path v-if="frac > 0" :class="progressClass" :d="arcPath(0, frac)" fill="none" :stroke-width="thickness" />
        <text class="st-solidGaugeChart__value" :x="cx" :y="cy - thickness * 0.1" text-anchor="middle" dominant-baseline="auto">{{ formatted }}</text>
        <text
          v-if="label"
          class="st-solidGaugeChart__label"
          :x="cx"
          :y="cy + thickness * 0.35"
          text-anchor="middle"
          dominant-baseline="hanging"
        >{{ label }}</text>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label ?? 'gauge'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
  </div>
</template>
