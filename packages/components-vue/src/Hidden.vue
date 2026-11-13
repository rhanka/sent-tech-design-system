<script setup lang="ts">
import { classNames } from './classNames.js';

export type HiddenBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

export type HiddenProps = {
  /** Hide when viewport is narrower than this breakpoint. */
  below?: HiddenBreakpoint;
  /** Hide when viewport is at or wider than this breakpoint. */
  above?: HiddenBreakpoint;
  as?: string;
  class?: string;
};

defineOptions({ name: 'Hidden', inheritAttrs: false });
const props = withDefaults(defineProps<HiddenProps>(), {
  below: undefined, above: undefined, as: 'div', class: undefined,
});
</script>

<template>
  <component :is="props.as" v-bind="{ ...($attrs), class: (classNames('st-hidden', props.below && `st-hidden--below-${props.below}`, props.above && `st-hidden--above-${props.above}`, props.class)) }" ><slot /></component>
</template>
