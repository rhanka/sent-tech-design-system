<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type ColorScaleBarOrientation = 'horizontal' | 'vertical';

export type ColorScaleBarProps = {
  colors: string[];
  orientation?: ColorScaleBarOrientation;
  length?: number;
  thickness?: number;
  min?: string;
  max?: string;
  label?: string;
  class?: string;
};

defineOptions({ name: 'ColorScaleBar', inheritAttrs: false });
const props = withDefaults(defineProps<ColorScaleBarProps>(), {
  colors: () => [],
  orientation: 'horizontal',
  length: undefined,
  thickness: undefined,
  min: undefined,
  max: undefined,
  label: undefined,
  class: undefined,
});

const orientation = computed(() => props.orientation ?? 'horizontal');
const isVertical = computed(() => orientation.value === 'vertical');
const hasEndLabels = computed(() => props.min !== undefined || props.max !== undefined);

const barStyle = computed<Record<string, string>>(() => {
  const colors = props.colors ?? [];
  const stops = colors.length >= 2 ? colors : colors.length === 1 ? [colors[0], colors[0]] : [];
  const direction = isVertical.value ? 'to top' : 'to right';
  const gradient = stops.length ? `linear-gradient(${direction}, ${stops.join(', ')})` : 'none';

  const safeLength = props.length !== undefined ? Math.max(Number(props.length) || 0, 1) : undefined;
  const safeThickness = props.thickness !== undefined ? Math.max(Number(props.thickness) || 0, 1) : undefined;

  const style: Record<string, string> = { background: gradient };
  if (isVertical.value) {
    if (safeLength !== undefined) style.height = `${safeLength}px`;
    if (safeThickness !== undefined) style.width = `${safeThickness}px`;
  } else {
    if (safeLength !== undefined) style.width = `${safeLength}px`;
    if (safeThickness !== undefined) style.height = `${safeThickness}px`;
  }
  return style;
});
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-colorScaleBar', `st-colorScaleBar--${orientation}`, props.class)">
    <span v-if="props.label" class="st-colorScaleBar__label">{{ props.label }}</span>
    <div class="st-colorScaleBar__track">
      <span v-if="hasEndLabels" class="st-colorScaleBar__end st-colorScaleBar__end--max">{{ props.max ?? '' }}</span>
      <div class="st-colorScaleBar__bar" :style="barStyle" role="img" :aria-label="props.label" />
      <span v-if="hasEndLabels" class="st-colorScaleBar__end st-colorScaleBar__end--min">{{ props.min ?? '' }}</span>
    </div>
  </div>
</template>
