<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';

export type RadioProps = {
  label: string;
  helperText?: string;
  invalid?: boolean;
  modelValue?: string;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

defineOptions({ name: 'Radio', inheritAttrs: false });
const props = withDefaults(defineProps<RadioProps>(), {
  helperText: undefined, invalid: false, modelValue: undefined, checked: undefined,
  disabled: false, name: undefined, value: undefined, class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [event: Event];
}>();

const attrs = useAttrs();
const isChecked = computed(() =>
  props.checked ?? (props.modelValue !== undefined && props.modelValue === props.value),
);

function onChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  emit('change', event);
}
const controlProps = computed(() => ({

  class: 'st-choice__input',
  type: 'radio',
  name: props.name,
  value: props.value,
  checked: isChecked.value,
  disabled: props.disabled,
  'aria-invalid': props.invalid ? ('true' as const) : undefined,
  onChange: onChange as (event: Event) => void,
}));
</script>

<template>
  <label :class="classNames('st-choice', 'st-choice--radio', props.class)">
    <input v-bind="{ ...$attrs, ...controlProps }" />
    <span class="st-choice__content">
      <span class="st-choice__label">{{ props.label }}</span>
      <span v-if="props.helperText" class="st-choice__help">{{ props.helperText }}</span>
    </span>
  </label>
</template>
