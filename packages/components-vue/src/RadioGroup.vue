<script setup lang="ts">
import { classNames } from './classNames.js';
import Radio from './Radio.vue';

export interface RadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type RadioGroupProps = {
  legend: string;
  /** Valeur sélectionnée (contrôlée). */
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  /** Nom partagé garantissant l'exclusivité radio. Requis. */
  name: string;
  options?: RadioGroupOption[];
  helperText?: string;
  /** Désactive le groupe entier. */
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'RadioGroup', inheritAttrs: false });
const props = withDefaults(defineProps<RadioGroupProps>(), {
  value: undefined, onChange: undefined, orientation: 'vertical', options: () => [],
  helperText: undefined, disabled: false, class: undefined,
});
const emit = defineEmits<{ change: [value: string] }>();

function select(optionValue: string) {
  if (optionValue === props.value) return;

  emit('change', optionValue);
}
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <fieldset
    v-bind="{ ...($attrs), class: (classNames('st-radioGroup', `st-radioGroup--${props.orientation}`, props.class)) }"

    :disabled="props.disabled"
  >
    <legend class="st-radioGroup__legend">{{ props.legend }}</legend>
    <p v-if="props.helperText" class="st-radioGroup__help">{{ props.helperText }}</p>
    <div class="st-radioGroup__options">
      <Radio
        v-for="option in props.options"
        :key="option.value"
        :label="option.label"
        :helper-text="option.helperText"
        :name="props.name"
        :value="option.value"
        :checked="props.value === option.value"
        :disabled="option.disabled"
        @change="() => select(option.value)"
      />
      <slot />
    </div>
  </fieldset>
</template>
