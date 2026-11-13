<script setup lang="ts">
import { classNames } from './classNames.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'Button', inheritAttrs: false });
const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary', size: 'md', type: 'button', disabled: false, class: undefined,
});
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <button v-bind="{ ...($attrs), class: (classNames('st-button', `st-button--${props.variant}`, `st-button--${props.size}`, props.class)) }" :type="props.type" :disabled="props.disabled" ><slot /></button>
</template>
