<script setup lang="ts">
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
    <svg  v-else   aria-hidden="true"  xmlns="http://www.w3.org/2000/svg" :width="18" :height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-chevron-down-icon lucide-circle-chevron-down"><circle cx="12" cy="12" r="10" /><path d="m16 10-4 4-4-4" /></svg>
  </button>
</template>
