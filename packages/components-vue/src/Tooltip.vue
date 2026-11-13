<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { ref, useId } from 'vue';
import { classNames } from './classNames.js';

export type TooltipPlacement = 'top' | 'bottom';

export type TooltipProps = {
  content?: string | number;
  placement?: TooltipPlacement;
  class?: string;
};

defineOptions({ name: 'Tooltip', inheritAttrs: false });
const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'top', class: undefined,
});
defineSlots<{
  'content'?: () => unknown;
  default?: () => unknown;
}>();

const tooltipId = `st-tooltip-${useId()}`;
const open = ref(false);
function show() { open.value = true; }
function hide() { open.value = false; }
</script>

<template>
  <span
    v-bind="{ ...($attrs), class: (classNames('st-tooltip', `st-tooltip--${props.placement}`, props.class)) }"

    @focusin="show"
    @focusout="hide"
    @focus="show"
    @blur="hide"
    @mouseenter="show"
    @mouseleave="hide"
  >
    <span class="st-tooltip__trigger"><slot /></span>
    <span :id="tooltipId" class="st-tooltip__content" role="tooltip" :aria-hidden="open ? 'false' : 'true'"><slot v-if="$slots['content']" name="content" /><template v-else>{{ scalarContent(props.content) }}</template></span>
  </span>
</template>
