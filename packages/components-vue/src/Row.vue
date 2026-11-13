<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import { classNames } from './classNames.js';
import { spacingToken } from './spacing.js';
import { alignValue, justifyValue } from './flex-layout.js';
import type { FlexAlign, FlexJustify } from './Flex.vue';
export type RowProps = {
  /** Spacing scale step (0..12) used for the column gutter. */
  gutter?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  as?: string;
  class?: string;
};
defineOptions({ name: 'Row', inheritAttrs: false });
const props = withDefaults(defineProps<RowProps>(), {
  gutter: 4,
  align: undefined,
  justify: undefined,
  wrap: true,
  as: 'div',
  class: undefined,
});
defineSlots<{ default?: () => unknown }>();
const bindings = computed(() => {
  const gap = spacingToken(props.gutter) ?? '0';
  const style = {
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
    alignItems: alignValue(props.align),
    justifyContent: justifyValue(props.justify),
    gap,
    '--st-row-gutter': gap,
  } as CSSProperties;

  return {  class: classNames('st-row', props.class), style };
});
</script>

<template>
  <component :is="props.as" v-bind="{ ...$attrs, ...bindings, style: [bindings.style, $attrs.style] }"><slot /></component>
</template>
