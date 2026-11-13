<script setup lang="ts">
import { normalizeStyle, computed, useAttrs } from 'vue';
import type { CSSProperties } from 'vue';
import { classNames } from './classNames.js';
import { spacingToken } from './spacing.js';
import { alignValue, justifyValue } from './flex-layout.js';
import type { FlexAlign, FlexJustify } from './Flex.vue';

export type StackProps = {
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  as?: string;
  class?: string;
};

defineOptions({ name: 'Stack', inheritAttrs: false });
const props = withDefaults(defineProps<StackProps>(), {
  gap: undefined, align: undefined, justify: undefined, as: 'div', class: undefined,
});

const attrs = useAttrs();
const stackStyle = computed(() => {
  const style: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: alignValue(props.align),
    justifyContent: justifyValue(props.justify),
    gap: spacingToken(props.gap),
    ...(normalizeStyle([attrs.style]) as CSSProperties),
  };
  return style;
});
</script>

<template>
  <component
    :is="props.as"
    v-bind="{ ...($attrs), class: (classNames('st-flex st-stack', props.class)), style: (stackStyle) }"


  >
    <slot />
  </component>
</template>
