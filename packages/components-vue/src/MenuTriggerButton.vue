<script setup lang="ts">
import Icon from './Icon.vue';
import { computed } from 'vue';

import { classNames } from './classNames.js';

export type MenuTriggerButtonSize = 'sm' | 'md' | 'lg';
export type MenuTriggerButtonVariant = 'ghost' | 'secondary';
export type MenuTriggerButtonProps = {
  open?: boolean;
  expanded?: boolean;
  size?: MenuTriggerButtonSize;
  variant?: MenuTriggerButtonVariant;
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'MenuTriggerButton', inheritAttrs: false });
const props = withDefaults(defineProps<MenuTriggerButtonProps>(), {
  open: undefined, expanded: undefined, size: 'md', variant: 'ghost', disabled: false, class: undefined,
});

const isOpen = computed(() => props.open ?? props.expanded ?? false);
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <button
    v-bind="{ ...($attrs), class: (classNames(`st-iconButton st-iconButton--${props.size} st-iconButton--${props.variant}`, props.class)) }"
    type="button"

    aria-haspopup="menu"
    :aria-expanded="isOpen"
    :disabled="props.disabled"
  >
    <slot v-if="$slots.default" />
    <Icon v-else name="circle-chevron-down" :size="18" />
  </button>
</template>
