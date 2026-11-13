<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import { classNames } from './classNames.js';
import { spacingToken } from './spacing.js';
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly';
export type FlexProps = {
  direction?: FlexDirection;
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  inline?: boolean;
  as?: string;
  class?: string;
};

import { alignValue, justifyValue } from './flex-layout.js';
defineOptions({ name: 'Flex', inheritAttrs: false });
const props = withDefaults(defineProps<FlexProps>(), {
  direction: 'row',
  gap: undefined,
  align: undefined,
  justify: undefined,
  wrap: false,
  inline: false,
  as: 'div',
  class: undefined,
});
defineSlots<{ default?: () => unknown }>();
const bindings = computed(() => {
  const style: CSSProperties = {
    display: props.inline ? 'inline-flex' : 'flex',
    flexDirection: props.direction,
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
    alignItems: alignValue(props.align),
    justifyContent: justifyValue(props.justify),
    gap: spacingToken(props.gap),
  };

  return {  class: classNames('st-flex', props.class), style };
});
</script>

<template>
  <component :is="props.as" v-bind="{ ...$attrs, ...bindings, style: [bindings.style, $attrs.style] }"><slot /></component>
</template>
