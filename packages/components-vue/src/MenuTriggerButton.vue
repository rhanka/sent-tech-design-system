<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDownCircle } from 'lucide-vue-next';
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
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    :class="classNames(`st-iconButton st-iconButton--${props.size} st-iconButton--${props.variant}`, props.class)"
    aria-haspopup="menu"
    :aria-expanded="isOpen"
    :disabled="props.disabled"
  >
    <slot v-if="$slots.default" />
    <ChevronDownCircle v-else :size="18" :stroke-width="2" aria-hidden="true" />
  </button>
</template>
