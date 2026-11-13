<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue';
import { classNames } from './classNames.js';

export type InputSize = 'sm' | 'md' | 'lg';

export type InputProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  size?: InputSize;
  id?: string;
  class?: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
};

defineOptions({ name: 'Input' });
const props = withDefaults(defineProps<InputProps>(), {
  label: undefined, helperText: undefined, errorText: undefined, invalid: false,
  size: 'md', id: undefined, class: undefined, modelValue: undefined,
  placeholder: undefined, disabled: false, readonly: false,
});
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [event: Event];
  input: [event: Event];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const attrs = useAttrs();
const uid = `st-input-${useId()}`;
const inputId = computed(() => props.id ?? uid);
const isInvalid = computed(() => props.invalid || Boolean(props.errorText));

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
  emit('input', event);
}
function onChange(event: Event) {
  emit('change', event);
}
function onFocus(event: FocusEvent) {
  emit('focus', event);
}
function onBlur(event: FocusEvent) {
  emit('blur', event);
}
const controlProps = computed(() => ({
  ...attrs,
  id: inputId.value,
  class: classNames('st-control', `st-control--${props.size}`),
  'aria-invalid': isInvalid.value ? ('true' as const) : undefined,
  value: props.modelValue,
  placeholder: props.placeholder,
  disabled: props.disabled,
  readonly: props.readonly,
  onInput: onInput as (event: Event) => void,
  onChange: onChange as (event: Event) => void,
  onFocus: onFocus as (event: FocusEvent) => void,
  onBlur: onBlur as (event: FocusEvent) => void,
}));
</script>

<template>
  <div :class="classNames('st-field', props.class)">
    <label class="st-field__control" :for="inputId">
      <span v-if="props.label" class="st-field__label">{{ props.label }}</span>
      <input v-bind="controlProps" />
    </label>
    <span v-if="props.errorText" class="st-field__error">{{ props.errorText }}</span>
    <span v-else-if="props.helperText" class="st-field__help">{{ props.helperText }}</span>
  </div>
</template>
