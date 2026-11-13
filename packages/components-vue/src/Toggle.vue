<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type ToggleSize = 'sm' | 'md';

export type ToggleProps = {
  label?: unknown;
  labelOn?: string;
  labelOff?: string;
  helperText?: unknown;
  size?: ToggleSize;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

defineOptions({ name: 'Toggle', inheritAttrs: false });
const props = withDefaults(defineProps<ToggleProps>(), {
  labelOn: 'On', labelOff: 'Off', helperText: undefined, size: 'md',
  modelValue: undefined, checked: undefined, disabled: false,
  name: undefined, value: undefined, class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [checked: boolean];
  change: [event: Event];
}>();
defineSlots<{
  /** @deprecated Use helper-text. */
  helperText?: () => unknown;
  label?: () => unknown;
  'helper-text'?: () => unknown;
}>();


const isChecked = computed(() => props.modelValue ?? props.checked ?? false);

function onToggle(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  emit('update:modelValue', checked);
  emit('change', event);
}

const inputProps = computed(() => ({

  class: 'st-toggle__input',
  type: 'checkbox',
  role: 'switch',
  'aria-checked': isChecked.value ? ('true' as const) : ('false' as const),
  checked: isChecked.value,
  disabled: props.disabled,
  name: props.name,
  value: props.value,
  onChange: onToggle as (event: Event) => void,
}));
</script>

<template>
  <label :class="classNames('st-toggle', `st-toggle--${props.size}`, props.class)">
    <span class="st-toggle__label"><template v-if="$slots.label"><slot name="label" /></template><template v-else>{{ scalarContent(props.label) }}</template></span>
    <span class="st-toggle__row">
      <input v-bind="{ ...$attrs, ...inputProps }" />
      <span class="st-toggle__track" aria-hidden="true">
        <span class="st-toggle__thumb" />
      </span>
      <span class="st-toggle__state" aria-hidden="true">{{ isChecked ? props.labelOn : props.labelOff }}</span>
    </span>
    <span v-if="($slots['helper-text'] || $slots.helperText) || props.helperText" class="st-toggle__help"><template v-if="($slots['helper-text'] || $slots.helperText)"><slot name="helper-text"><slot name="helperText" /></slot></template><template v-else>{{ scalarContent(props.helperText) }}</template></span>
  </label>
</template>
