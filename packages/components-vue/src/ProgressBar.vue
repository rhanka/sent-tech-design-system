<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type ProgressBarTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export type ProgressBarProps = {
  label?: unknown;
  helperText?: string;
  value?: number;
  max?: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  indeterminate?: boolean;
  showValue?: boolean;
  valueText?: string;
  class?: string;
};

defineOptions({ name: 'ProgressBar', inheritAttrs: false });
const props = withDefaults(defineProps<ProgressBarProps>(), {
  label: undefined, helperText: undefined, value: 0, max: 100, tone: 'neutral', size: 'md',
  indeterminate: false, showValue: false, valueText: undefined, class: undefined,
});

const max = computed(() => props.max ?? 100);
const value = computed(() => props.value ?? 0);
const clamped = computed(() => (max.value <= 0 ? 0 : Math.min(Math.max(value.value, 0), max.value)));
const percent = computed(() => (props.indeterminate ? 0 : (clamped.value / max.value) * 100));
const displayValue = computed(() =>
  props.valueText
    ? props.valueText
    : props.indeterminate
      ? ''
      : `${Math.round(percent.value)}%`,
);
const showValueSpan = computed(() => props.showValue && !props.indeterminate);
const showHeader = computed(() => Boolean(props.label) || showValueSpan.value);
defineSlots<{
  'label'?: () => unknown;
}>();
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-progressBar', props.class)) }" >
    <div v-if="showHeader || $slots.label" class="st-progressBar__header">
      <span v-if="$slots['label'] || props.label" class="st-progressBar__label"><slot v-if="$slots['label']" name="label" /><template v-else>{{ scalarContent(props.label) }}</template></span>
      <span v-if="showValueSpan" class="st-progressBar__value" aria-hidden="true">{{ displayValue }}</span>
    </div>
    <div
      :class="classNames('st-progressBar__track', `st-progressBar__track--${props.size}`, `st-progressBar__track--${props.tone}`, props.indeterminate && 'st-progressBar__track--indeterminate')"
      role="progressbar"
      :aria-valuemin="props.indeterminate ? undefined : 0"
      :aria-valuemax="props.indeterminate ? undefined : max"
      :aria-valuenow="props.indeterminate ? undefined : clamped"
      :aria-valuetext="props.indeterminate ? undefined : displayValue"
      :aria-label="typeof props.label === 'string' ? props.label : undefined"
    >
      <div class="st-progressBar__fill" :style="{ '--st-progressBar-pct': `${percent}%` }" />
    </div>
    <span v-if="props.helperText" class="st-progressBar__help">{{ props.helperText }}</span>
  </div>
</template>
