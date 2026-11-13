<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { useSlots, computed, useAttrs, useId } from 'vue';
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

defineOptions({ name: 'Select', inheritAttrs: false });
const props = withDefaults(defineProps<SelectProps>(), {
  label: undefined, helperText: undefined, errorText: undefined, invalid: false,
  size: 'md', options: undefined, modelValue: undefined, disabled: false, class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [event: Event];
}>();
defineSlots<{
  'option-label'?: (scope: { option: SelectOption }) => unknown;
  'error-text'?: () => unknown;
  'helper-text'?: () => unknown;
  'label'?: () => unknown;
  default?: () => unknown;
}>();

const attrs = useAttrs();
const autoId = `st-select-${useId()}`;
const uid = computed(() => (attrs.id as string | undefined) ?? autoId);
const slots = useSlots();
const isInvalid = () => (props.invalid || Boolean(props.errorText)) || Boolean(slots['error-text']);

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value);
  emit('change', event);
}
const controlProps = () => ({

  id: uid.value,
  class: classNames('st-select', `st-select--${props.size}`),
  'aria-invalid': isInvalid() ? ('true' as const) : undefined,
  value: props.modelValue,
  disabled: props.disabled,
  onChange: onChange as (event: Event) => void,
});
</script>

<template>
  <div :class="classNames('st-field', props.class)">
    <label class="st-field__control" :for="uid">
      <span v-if="$slots['label'] || props.label" class="st-field__label"><slot v-if="$slots['label']" name="label" /><template v-else>{{ scalarContent(props.label) }}</template></span>
      <select v-bind="{ ...$attrs, ...controlProps() }">
        <slot v-if="$slots.default" />
        <option
          v-else
          v-for="option in props.options ?? []"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        ><slot v-if="$slots['option-label']" name="option-label" :option="option" /><template v-else>{{ scalarContent(option.label) }}</template></option>
      </select>
    </label>
    <span v-if="$slots['error-text'] || props.errorText" class="st-field__error"><slot v-if="$slots['error-text']" name="error-text" /><template v-else>{{ scalarContent(props.errorText) }}</template></span>
    <span v-else-if="$slots['helper-text'] || props.helperText" class="st-field__help"><slot v-if="$slots['helper-text']" name="helper-text" /><template v-else>{{ scalarContent(props.helperText) }}</template></span>
  </div>
</template>
