<script setup lang="ts">
import { useSlots, useAttrs } from 'vue';
import { classNames } from './classNames.js';
import Flex from './Flex.vue';
import type { FlexAlign, FlexJustify } from './Flex.vue';
export type InlineProps = {
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  as?: string;
  class?: string;
};
defineOptions({ name: 'Inline' });
const props = withDefaults(defineProps<InlineProps>(), {
  gap: undefined,
  align: undefined,
  justify: undefined,
  wrap: true,
  as: 'div',
  class: undefined,
});
const slots = useSlots();
const attrs = useAttrs();
</script>

<template>
  <Flex
    v-bind="$attrs"
    :as="props.as"
    :gap="props.gap"
    :align="props.align"
    :justify="props.justify"
    :wrap="props.wrap"
    direction="row"
    :class="classNames('st-inline', props.class)"
    ><slot
  /></Flex>
</template>
