<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type SliderSize = 'sm' | 'md' | 'lg';

export type SliderProps = {
  label?: string;
  size?: SliderSize;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  modelValue?: number;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'Slider', inheritAttrs: false });
const props = withDefaults(defineProps<SliderProps>(), {
  label: undefined, size: 'md', value: undefined, defaultValue: undefined, min: 0, max: 100, step: 1,
  modelValue: undefined, helperText: undefined, errorText: undefined, invalid: false, showValue: true,
  valueFormatter: undefined, disabled: false, class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: number];
  change: [value: number];
}>();

const seed = props.modelValue ?? props.value ?? props.defaultValue ?? props.min;
const internal = ref<number>(Number.isFinite(Number(seed)) ? Number(seed) : props.min);

const controlled = computed(() => props.modelValue !== undefined || props.value !== undefined);
const min = computed(() => props.min);
const max = computed(() => props.max);
const safe = computed(() => {
  const raw = controlled.value ? (props.modelValue ?? props.value ?? min.value) : internal.value;
  if (!Number.isFinite(Number(raw))) return min.value;
  if (Number(raw) < min.value) return min.value;
  if (Number(raw) > max.value) return max.value;
  return Number(raw);
});
const percent = computed(() => (max.value === min.value ? 0 : ((safe.value - min.value) / (max.value - min.value)) * 100));
const formatted = computed(() => (props.valueFormatter ? props.valueFormatter(safe.value) : String(safe.value)));
const isInvalid = computed(() => props.invalid || Boolean(props.errorText));

function onInput(event: Event) {
  const val = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(val)) {
    if (!controlled.value) internal.value = val;
    emit('update:modelValue', val);
    emit('change', val);
  }
}
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-field', props.class)) }" >
    <div class="st-slider__header">
      <span v-if="props.label" class="st-field__label">{{ props.label }}</span>
      <output v-if="props.showValue" class="st-slider__value" aria-live="polite">{{ formatted }}</output>
    </div>
    <span :class="classNames('st-slider', `st-slider--${props.size}`)">
      <span class="st-slider__bounds" aria-hidden="true">{{ String(min) }}</span>
      <span class="st-slider__track">
        <span class="st-slider__fill" :style="`--st-slider-fill: ${percent}%`" />
        <span class="st-slider__thumb" :style="`left: ${percent}%`" aria-hidden="true">
          <span v-if="props.showValue" class="st-slider__tooltip">{{ formatted }}</span>
        </span>
        <input
          class="st-slider__input"
          type="range"
          :aria-label="props.label"
          :aria-invalid="isInvalid ? 'true' : undefined"
          :value="safe"
          :min="props.min"
          :max="props.max"
          :step="props.step"
          :disabled="props.disabled"
          @input="onInput"
        />
      </span>
      <span class="st-slider__bounds" aria-hidden="true">{{ String(max) }}</span>
    </span>
    <span v-if="props.errorText" class="st-field__error">{{ props.errorText }}</span>
    <span v-else-if="props.helperText" class="st-field__help">{{ props.helperText }}</span>
  </div>
</template>
