<script setup lang="ts">
import { ref, useId } from 'vue';
import { classNames } from './classNames.js';

export type TooltipPlacement = 'top' | 'bottom';

export type TooltipProps = {
  content: unknown;
  placement?: TooltipPlacement;
  class?: string;
};

defineOptions({ name: 'Tooltip', inheritAttrs: false });
const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'top', class: undefined,
});
defineSlots<{
  default?: () => unknown;
}>();

const tooltipId = `st-tooltip-${useId()}`;
const open = ref(false);
function show() { open.value = true; }
function hide() { open.value = false; }
</script>

<template>
  <span
    v-bind="$attrs"
    :class="classNames('st-tooltip', `st-tooltip--${props.placement}`, props.class)"
    @focus="show"
    @blur="hide"
    @mouseenter="show"
    @mouseleave="hide"
  >
    <span class="st-tooltip__trigger"><slot /></span>
    <span :id="tooltipId" class="st-tooltip__content" role="tooltip" :aria-hidden="open ? 'false' : 'true'">{{ props.content }}</span>
  </span>
</template>
