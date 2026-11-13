<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type RangeSliderSize = 'sm' | 'md' | 'lg';

export type RangeSliderProps = {
  /** Valeur contrôlée via v-model [poignée basse, poignée haute]. */
  modelValue?: [number, number];
  /** Alias contrôlé sans v-model. */
  value?: [number, number];
  /** Valeur initiale en mode non-contrôlé. Défaut [min, max]. */
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  size?: RangeSliderSize;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  ariaLabelMin?: string;
  ariaLabelMax?: string;
  class?: string;
};

defineOptions({ name: 'RangeSlider' });
const props = withDefaults(defineProps<RangeSliderProps>(), {
  modelValue: undefined, value: undefined, defaultValue: undefined, min: 0, max: 100, step: 1,
  size: 'md', disabled: false, label: undefined, helperText: undefined, errorText: undefined,
  invalid: false, showValue: true, valueFormatter: undefined, ariaLabelMin: 'Valeur minimale',
  ariaLabelMax: 'Valeur maximale', class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: [number, number]];
  change: [value: [number, number]];
}>();

function clampStep(n: number): number {
  if (!Number.isFinite(n)) return props.min;
  let v = Math.min(Math.max(n, props.min), props.max);
  if (Number.isFinite(props.step) && props.step > 0) {
    v = props.min + Math.round((v - props.min) / props.step) * props.step;
    v = Math.min(Math.max(v, props.min), props.max);
  }
  return v;
}

function normalizePair(pair: [number, number]): [number, number] {
  let lo = clampStep(pair[0]);
  let hi = clampStep(pair[1]);
  if (lo > hi) {
    const mid = lo;
    lo = Math.min(mid, hi);
    hi = Math.max(mid, hi);
  }
  return [lo, hi];
}

const internal = ref<[number, number]>(normalizePair(props.defaultValue ?? [props.min, props.max]));

const isControlled = computed(() => Array.isArray(props.modelValue) || Array.isArray(props.value));
const current = computed(() => {
  const source = props.modelValue ?? props.value ?? internal.value ?? [props.min, props.max];
  return normalizePair(source as [number, number]);
});
const lowValue = computed(() => current.value[0]);
const highValue = computed(() => current.value[1]);
const lowPercent = computed(() =>
  props.max === props.min ? 0 : ((lowValue.value - props.min) / (props.max - props.min)) * 100,
);
const highPercent = computed(() =>
  props.max === props.min ? 0 : ((highValue.value - props.min) / (props.max - props.min)) * 100,
);
const lowLabel = computed(() => (props.valueFormatter ? props.valueFormatter(lowValue.value) : String(lowValue.value)));
const highLabel = computed(() =>
  props.valueFormatter ? props.valueFormatter(highValue.value) : String(highValue.value),
);
const isInvalid = computed(() => props.invalid || Boolean(props.errorText));

function commit(next: [number, number]) {
  const normalized = normalizePair(next);
  if (!isControlled.value) internal.value = normalized;
  emit('update:modelValue', normalized);
  emit('change', normalized);
}

function setLow(raw: number) {
  if (props.disabled) return;
  const lo = Math.min(clampStep(raw), highValue.value);
  commit([lo, highValue.value]);
}

function setHigh(raw: number) {
  if (props.disabled) return;
  const hi = Math.max(clampStep(raw), lowValue.value);
  commit([lowValue.value, hi]);
}

function keyDelta(event: KeyboardEvent, val: number): number | null {
  const big = (Number.isFinite(props.step) && props.step > 0 ? props.step : 1) * 10;
  const small = Number.isFinite(props.step) && props.step > 0 ? props.step : 1;
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return val + small;
    case 'ArrowLeft':
    case 'ArrowDown':
      return val - small;
    case 'PageUp':
      return val + big;
    case 'PageDown':
      return val - big;
    case 'Home':
      return props.min;
    case 'End':
      return props.max;
    default:
      return null;
  }
}

function onLowKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  const next = keyDelta(event, lowValue.value);
  if (next === null) return;
  event.preventDefault();
  setLow(next);
}

function onHighKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  const next = keyDelta(event, highValue.value);
  if (next === null) return;
  event.preventDefault();
  setHigh(next);
}
</script>

<template>
  <div :class="classNames('st-field', props.class)">
    <div class="st-rangeSlider__header">
      <span v-if="props.label" class="st-field__label">{{ props.label }}</span>
      <output v-if="props.showValue" class="st-rangeSlider__value" aria-live="polite">{{ `${lowLabel} – ${highLabel}` }}</output>
    </div>
    <span
      :class="classNames(
        'st-rangeSlider',
        `st-rangeSlider--${props.size}`,
        props.disabled ? 'st-rangeSlider--disabled' : undefined,
      )"
    >
      <span class="st-rangeSlider__bounds" aria-hidden="true">{{ String(props.min) }}</span>
      <span class="st-rangeSlider__track" :aria-invalid="isInvalid ? 'true' : undefined">
        <span
          class="st-rangeSlider__fill"
          :style="{ left: `${lowPercent}%`, width: `${Math.max(0, highPercent - lowPercent)}%` }"
        />
        <span
          class="st-rangeSlider__thumb st-rangeSlider__thumb--low"
          :style="{ left: `${lowPercent}%` }"
          role="slider"
          :tabindex="props.disabled ? -1 : 0"
          :aria-label="props.ariaLabelMin"
          :aria-valuemin="props.min"
          :aria-valuemax="highValue"
          :aria-valuenow="lowValue"
          :aria-valuetext="lowLabel"
          :aria-disabled="props.disabled ? 'true' : undefined"
          @keydown="onLowKeydown"
        >
          <span v-if="props.showValue" class="st-rangeSlider__tooltip">{{ lowLabel }}</span>
        </span>
        <span
          class="st-rangeSlider__thumb st-rangeSlider__thumb--high"
          :style="{ left: `${highPercent}%` }"
          role="slider"
          :tabindex="props.disabled ? -1 : 0"
          :aria-label="props.ariaLabelMax"
          :aria-valuemin="lowValue"
          :aria-valuemax="props.max"
          :aria-valuenow="highValue"
          :aria-valuetext="highLabel"
          :aria-disabled="props.disabled ? 'true' : undefined"
          @keydown="onHighKeydown"
        >
          <span v-if="props.showValue" class="st-rangeSlider__tooltip">{{ highLabel }}</span>
        </span>
      </span>
      <span class="st-rangeSlider__bounds" aria-hidden="true">{{ String(props.max) }}</span>
    </span>
    <span v-if="props.errorText" class="st-field__error">{{ props.errorText }}</span>
    <span v-else-if="props.helperText" class="st-field__help">{{ props.helperText }}</span>
  </div>
</template>
