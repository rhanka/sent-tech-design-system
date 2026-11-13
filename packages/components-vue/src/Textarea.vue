<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { classNames } from './classNames.js';
import { nextTextareaId } from './textareaId.js';

export type TextareaProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  class?: string;
};

defineOptions({ name: 'Textarea' });
const props = withDefaults(defineProps<TextareaProps>(), {
  label: undefined, helperText: undefined, errorText: undefined, invalid: false,
  modelValue: undefined, placeholder: undefined, disabled: false, readonly: false,
  rows: undefined, class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [event: Event];
  input: [event: Event];
}>();
defineSlots<{
  label?: () => unknown;
  'helper-text'?: () => unknown;
  'error-text'?: () => unknown;
}>();

const attrs = useAttrs();
const inputId = ref(nextTextareaId());
const isInvalid = computed(() => props.invalid || Boolean(props.errorText));

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
  emit('input', event);
}
function onChange(event: Event) {
  emit('change', event);
}
const controlProps = computed(() => ({
  ...attrs,
  id: inputId.value,
  class: 'st-textarea st-control',
  'aria-invalid': isInvalid.value ? ('true' as const) : undefined,
  value: props.modelValue,
  placeholder: props.placeholder,
  disabled: props.disabled,
  readonly: props.readonly,
  rows: props.rows,
  onInput,
  onChange,
}));
</script>

<template>
  <div :class="classNames('st-field', props.class)">
    <label class="st-field__control" :for="inputId">
      <span v-if="$slots.label || props.label" class="st-field__label"><template v-if="$slots.label"><slot name="label" /></template><template v-else>{{ props.label }}</template></span>
      <textarea v-bind="controlProps" />
    </label>
    <span v-if="$slots['error-text'] || props.errorText" class="st-field__error"><template v-if="$slots['error-text']"><slot name="error-text" /></template><template v-else>{{ props.errorText }}</template></span>
    <span v-else-if="$slots['helper-text'] || props.helperText" class="st-field__help"><template v-if="$slots['helper-text']"><slot name="helper-text" /></template><template v-else>{{ props.helperText }}</template></span>
  </div>
</template>
