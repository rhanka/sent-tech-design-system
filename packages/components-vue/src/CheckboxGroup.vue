<script setup lang="ts">
import { classNames } from './classNames.js';
import Checkbox from './Checkbox.vue';

export interface CheckboxGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type CheckboxGroupProps = {
  legend: string;
  /** Valeurs cochées (liste contrôlée). */
  value?: string[];
  onChange?: (value: string[]) => void;
  orientation?: 'vertical' | 'horizontal';
  /** Nom partagé par les cases (utile pour la soumission de formulaire). */
  name?: string;
  options?: CheckboxGroupOption[];
  /** Description optionnelle affichée sous la légende. */
  helperText?: string;
  /** Désactive le groupe entier. */
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'CheckboxGroup', inheritAttrs: false });
const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  value: () => [],
  onChange: undefined,
  orientation: 'vertical',
  name: undefined,
  options: () => [],
  helperText: undefined,
  disabled: false,
  class: undefined,
});
const emit = defineEmits<{ change: [value: string[]] }>();

function toggle(optionValue: string, checked: boolean) {
  const next = checked
    ? [...props.value, optionValue]
    : props.value.filter((v) => v !== optionValue);

  emit('change', next);
}

function onCheckboxChange(event: Event, option: CheckboxGroupOption) {
  toggle(option.value, (event.target as HTMLInputElement).checked);
}
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <fieldset
    v-bind="{ ...($attrs), class: (classNames('st-checkboxGroup', `st-checkboxGroup--${props.orientation}`, props.class)) }"

    :disabled="props.disabled"
  >
    <legend class="st-checkboxGroup__legend">{{ props.legend }}</legend>
    <p v-if="props.helperText" class="st-checkboxGroup__help">{{ props.helperText }}</p>
    <div class="st-checkboxGroup__options">
      <Checkbox
        v-for="option in props.options"
        :key="option.value"
        :label="option.label"
        :helper-text="option.helperText"
        :name="props.name"
        :value="option.value"
        :checked="props.value.includes(option.value)"
        :disabled="option.disabled"
        @change="onCheckboxChange($event, option)"
      />
      <slot />
    </div>
  </fieldset>
</template>
