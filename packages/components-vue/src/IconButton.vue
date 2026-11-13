<script setup lang="ts">
import { classNames } from './classNames.js';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'secondary' | 'danger' | 'ghost';

export type IconButtonProps = {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'IconButton', inheritAttrs: false });
const props = withDefaults(defineProps<IconButtonProps>(), {
  size: 'md', variant: 'ghost', type: 'button', disabled: false, class: undefined,
});
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <button v-bind="{ ...($attrs), class: (classNames('st-iconButton', `st-iconButton--${props.size}`, `st-iconButton--${props.variant}`, props.class)) }" :type="props.type" :disabled="props.disabled" ><slot /></button>
</template>
