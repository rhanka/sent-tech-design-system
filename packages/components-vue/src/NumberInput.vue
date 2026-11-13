<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { classNames } from './classNames.js';
import { nextNumberInputId } from './numberInputId.js';

export type NumberInputSize = 'sm' | 'md' | 'lg';

export type NumberInputProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  size?: NumberInputSize;
  modelValue?: number | string;
  /** Svelte/React-canonical alias for `modelValue`. */
  value?: number | string | null;
  disabled?: boolean;
  readonly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  incrementLabel?: string;
  decrementLabel?: string;
  class?: string;
};

defineOptions({ name: 'NumberInput' });
const props = withDefaults(defineProps<NumberInputProps>(), {
  label: undefined, helperText: undefined, errorText: undefined, size: 'md', modelValue: undefined,
  value: undefined, disabled: false, readonly: false, min: undefined, max: undefined, step: undefined,
  incrementLabel: 'Increment value', decrementLabel: 'Decrement value', class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: number | null];
  change: [event: Event];
  input: [event: Event];
}>();

const attrs = useAttrs();
const inputId = ref(nextNumberInputId());
const controlled = computed(() => props.modelValue !== undefined);
const numValue = computed<number | null>(() => {
  const bound = props.modelValue ?? props.value;
  if (bound === null || bound === undefined || bound === '') return null;
  const n = Number(bound);
  return Number.isFinite(n) ? n : null;
});
const internal = ref(refSeed());
function refSeed(): number | null {
  const seed = props.modelValue ?? props.value;
  return seed !== undefined && seed !== null && seed !== '' ? Number(seed) : null;
}
const shownValue = computed<number | null>(() => (controlled.value ? numValue.value : internal.value));
const numMin = computed(() => (props.min !== undefined && props.min !== '' ? Number(props.min) : undefined));
const numMax = computed(() => (props.max !== undefined && props.max !== '' ? Number(props.max) : undefined));
const numStep = computed(() => (props.step !== undefined && props.step !== '' ? Number(props.step) : 1));
const isInvalid = computed(() => Boolean(props.errorText));
const isAtMin = computed(() => shownValue.value !== null && numMin.value !== undefined && shownValue.value <= numMin.value);
const isAtMax = computed(() => shownValue.value !== null && numMax.value !== undefined && shownValue.value >= numMax.value);

function clamp(n: number): number {
  if (numMin.value !== undefined && n < numMin.value) return numMin.value;
  if (numMax.value !== undefined && n > numMax.value) return numMax.value;
  return n;
}
function setValue(next: number | null) {
  if (!controlled.value) internal.value = next;
  emit('update:modelValue', next);
}
function increment() {
  setValue(clamp((shownValue.value ?? numMin.value ?? 0) + numStep.value));
}
function decrement() {
  setValue(clamp((shownValue.value ?? numMax.value ?? 0) - numStep.value));
}
function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  setValue(raw === '' ? null : Number.isFinite(Number(raw)) ? Number(raw) : shownValue.value);
  emit('input', event);
}
function onChange(event: Event) {
  emit('change', event);
}
const controlProps = computed(() => ({
  ...attrs,
  id: inputId.value,
  class: 'st-numberInput__control',
  type: 'number',
  'aria-invalid': isInvalid.value ? ('true' as const) : undefined,
  value: shownValue.value ?? '',
  disabled: props.disabled,
  readonly: props.readonly,
  min: props.min,
  max: props.max,
  step: props.step,
  onInput: onInput as (event: Event) => void,
  onChange: onChange as (event: Event) => void,
}));
</script>

<template>
  <div :class="classNames('st-field', props.class)">
    <label class="st-field__control" :for="inputId">
      <span v-if="props.label" class="st-field__label">{{ props.label }}</span>
      <span :class="classNames('st-numberInput', `st-numberInput--${props.size}`)">
        <input v-bind="controlProps" />
        <span class="st-numberInput__buttons">
          <button
            type="button"
            class="st-numberInput__button"
            :aria-label="props.decrementLabel"
            :disabled="props.disabled || isAtMin"
            @click="decrement"
          ><span aria-hidden="true">−</span></button>
          <button
            type="button"
            class="st-numberInput__button"
            :aria-label="props.incrementLabel"
            :disabled="props.disabled || isAtMax"
            @click="increment"
          ><span aria-hidden="true">+</span></button>
        </span>
      </span>
    </label>
    <span v-if="props.errorText" class="st-field__error">{{ props.errorText }}</span>
    <span v-else-if="props.helperText" class="st-field__help">{{ props.helperText }}</span>
  </div>
</template>
