<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { useSlots, computed, useId } from 'vue';
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

defineOptions({ name: 'Input', inheritAttrs: false });
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


const uid = `st-input-${useId()}`;
const inputId = computed(() => props.id ?? uid);
const slots = useSlots();
const isInvalid = () => (props.invalid || Boolean(props.errorText)) || Boolean(slots['error-text']);

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
const controlProps = () => ({

  id: inputId.value,
  class: classNames('st-control', `st-control--${props.size}`),
  'aria-invalid': isInvalid() ? ('true' as const) : undefined,
  value: props.modelValue,
  placeholder: props.placeholder,
  disabled: props.disabled,
  readonly: props.readonly,
  onInput: onInput as (event: Event) => void,
  onChange: onChange as (event: Event) => void,
  onFocus: onFocus as (event: FocusEvent) => void,
  onBlur: onBlur as (event: FocusEvent) => void,
});
defineSlots<{
  'error-text'?: () => unknown;
  'helper-text'?: () => unknown;
  'label'?: () => unknown;
}>();
</script>

<template>
  <div :class="classNames('st-field', props.class)">
    <label class="st-field__control" :for="inputId">
      <span v-if="$slots['label'] || props.label" class="st-field__label"><slot v-if="$slots['label']" name="label" /><template v-else>{{ scalarContent(props.label) }}</template></span>
      <input v-bind="{ ...$attrs, ...controlProps() }" />
    </label>
    <span v-if="$slots['error-text'] || props.errorText" class="st-field__error"><slot v-if="$slots['error-text']" name="error-text" /><template v-else>{{ scalarContent(props.errorText) }}</template></span>
    <span v-else-if="$slots['helper-text'] || props.helperText" class="st-field__help"><slot v-if="$slots['helper-text']" name="helper-text" /><template v-else>{{ scalarContent(props.helperText) }}</template></span>
  </div>
</template>
