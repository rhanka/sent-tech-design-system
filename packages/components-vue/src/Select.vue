<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue';
import { classNames } from './classNames.js';

export type SelectSize = 'sm' | 'md' | 'lg';

export type SelectOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type SelectProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  size?: SelectSize;
  options?: SelectOption[];
  modelValue?: string;
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'Select' });
const props = withDefaults(defineProps<SelectProps>(), {
  label: undefined, helperText: undefined, errorText: undefined, invalid: false,
  size: 'md', options: undefined, modelValue: undefined, disabled: false, class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [event: Event];
}>();
defineSlots<{
  default?: () => unknown;
}>();

const attrs = useAttrs();
const uid = `st-select-${useId()}`;
const isInvalid = computed(() => props.invalid || Boolean(props.errorText));

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value);
  emit('change', event);
}
const controlProps = computed(() => ({
  ...attrs,
  id: uid,
  class: classNames('st-select', `st-select--${props.size}`),
  'aria-invalid': isInvalid.value ? ('true' as const) : undefined,
  value: props.modelValue,
  disabled: props.disabled,
  onChange: onChange as (event: Event) => void,
}));
</script>

<template>
  <div :class="classNames('st-field', props.class)">
    <label class="st-field__control" :for="uid">
      <span v-if="props.label" class="st-field__label">{{ props.label }}</span>
      <select v-bind="controlProps">
        <slot v-if="$slots.default" />
        <option
          v-else
          v-for="option in props.options ?? []"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >{{ option.label }}</option>
      </select>
    </label>
    <span v-if="props.errorText" class="st-field__error">{{ props.errorText }}</span>
    <span v-else-if="props.helperText" class="st-field__help">{{ props.helperText }}</span>
  </div>
</template>
