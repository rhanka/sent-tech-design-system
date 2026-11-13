<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type SparklineTone = 'neutral' | 'success' | 'warning' | 'error';

export type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: boolean;
  label?: string;
  class?: string;
};

const PADDING = 2;

defineOptions({ name: 'Sparkline', inheritAttrs: false });
const props = withDefaults(defineProps<SparklineProps>(), {
  width: 120, height: 28, tone: 'neutral', strokeWidth: 1.5, area: false, label: undefined, class: undefined,
});

const width = computed(() => props.width ?? 120);
const height = computed(() => props.height ?? 28);
const tone = computed(() => props.tone ?? 'neutral');
const strokeWidth = computed(() => props.strokeWidth ?? 1.5);
const area = computed(() => props.area ?? false);
const label = computed(() => props.label);

const line = computed(() => {
  const data = props.data;
  if (!data || data.length === 0) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const innerWidth = Math.max(width.value - PADDING * 2, 1);
  const innerHeight = Math.max(height.value - PADDING * 2, 1);
  const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;
  const pts = data.map((value, index) => {
    const x = PADDING + step * index;
    const normalised = (value - min) / span;
    const y = PADDING + (1 - normalised) * innerHeight;
    return { x, y };
  });
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
});

const areaPath = computed(() => {
  const data = props.data;
  if (!data || data.length === 0) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const innerWidth = Math.max(width.value - PADDING * 2, 1);
  const innerHeight = Math.max(height.value - PADDING * 2, 1);
  const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;
  const pts = data.map((value, index) => {
    const x = PADDING + step * index;
    const normalised = (value - min) / span;
    const y = PADDING + (1 - normalised) * innerHeight;
    return { x, y };
  });
  const baseline = height.value - PADDING;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const l = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  return `${l} L${last.x.toFixed(2)},${baseline.toFixed(2)} L${first.x.toFixed(2)},${baseline.toFixed(2)} Z`;
});
</script>

<template>
  <span
    v-bind="$attrs"
    :class="classNames('st-sparkline', `st-sparkline--${tone}`, props.class)"
    role="img"
    :aria-label="label"
  >
    <svg
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
      :aria-hidden="label ? 'true' : undefined"
      focusable="false"
    >
      <path v-if="area && areaPath" :d="areaPath" class="st-sparkline__area" />
      <path
        v-if="line"
        :d="line"
        class="st-sparkline__line"
        fill="none"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</template>
