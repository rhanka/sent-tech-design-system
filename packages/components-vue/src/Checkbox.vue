<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue';
import { classNames } from './classNames.js';

export type CheckboxProps = {
  label: string;
  helperText?: string;
  /** Secondary muted description line under the label (e.g. a filter hint). */
  description?: string;
  invalid?: boolean;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

defineOptions({ name: 'Checkbox' });
const props = withDefaults(defineProps<CheckboxProps>(), {
  helperText: undefined, description: undefined, invalid: false, modelValue: undefined,
  checked: undefined, disabled: false, name: undefined, value: undefined, class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [event: Event];
}>();
defineSlots<{
  trailing?: () => unknown;
}>();

const attrs = useAttrs();
const uid = `st-checkbox-${useId()}`;
const descriptionId = computed(() => `${uid}-description`);
const describedBy = computed(() => {
  const consumerDescribedBy = attrs['aria-describedby'] as string | undefined;
  return props.description
    ? [consumerDescribedBy, descriptionId.value].filter(Boolean).join(' ')
    : consumerDescribedBy;
});

function onChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  emit('update:modelValue', checked);
  emit('change', event);
}
const controlProps = computed(() => ({
  ...attrs,
  class: 'st-choice__input',
  type: 'checkbox',
  name: props.name,
  value: props.value,
  checked: props.modelValue ?? props.checked,
  disabled: props.disabled,
  'aria-invalid': props.invalid ? ('true' as const) : undefined,
  'aria-describedby': describedBy.value,
  onChange: onChange as (event: Event) => void,
}));
</script>

<template>
  <label
    :class="classNames('st-choice', 'st-choice--checkbox', props.description ? 'st-choice--described' : undefined, props.class)"
  >
    <input v-bind="controlProps" />
    <span class="st-choice__content">
      <span class="st-choice__label">{{ props.label }}</span>
      <span v-if="props.description" class="st-choice__description" :id="descriptionId">{{ props.description }}</span>
      <span v-if="props.helperText" class="st-choice__help">{{ props.helperText }}</span>
    </span>
    <span v-if="$slots.trailing" class="st-choice__trailing"><slot name="trailing" /></span>
  </label>
</template>
