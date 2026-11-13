<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';

export type SwitchProps = {
  label?: unknown;
  helperText?: unknown;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

defineOptions({ name: 'Switch', inheritAttrs: false });
const props = withDefaults(defineProps<SwitchProps>(), {
  helperText: undefined, modelValue: undefined, checked: undefined, disabled: false,
  name: undefined, value: undefined, class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [event: Event];
}>();
defineSlots<{
  label?: () => unknown;
  'helper-text'?: () => unknown;
}>();

const attrs = useAttrs();

function onChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  emit('update:modelValue', checked);
  emit('change', event);
}
const controlProps = computed(() => ({

  class: 'st-switch__input',
  type: 'checkbox',
  role: 'switch',
  'aria-checked': props.modelValue ?? props.checked ?? undefined,
  checked: props.modelValue ?? props.checked,
  disabled: props.disabled,
  name: props.name,
  value: props.value,
  onChange,
}));
</script>

<template>
  <label :class="classNames('st-switch', props.class)">
    <input v-bind="{ ...$attrs, ...controlProps }" />
    <span class="st-switch__track"><span class="st-switch__thumb" /></span>
    <span class="st-switch__content">
      <span class="st-switch__label"><template v-if="$slots.label"><slot name="label" /></template><template v-else>{{ scalarContent(props.label) }}</template></span>
      <span v-if="$slots['helper-text'] || props.helperText" class="st-switch__help"><template v-if="$slots['helper-text']"><slot name="helper-text" /></template><template v-else>{{ scalarContent(props.helperText) }}</template></span>
    </span>
  </label>
</template>
