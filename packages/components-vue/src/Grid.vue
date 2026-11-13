<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import { classNames } from './classNames.js';
import { spacingToken } from './spacing.js';
export type GridProps = {
  /** Number of equal columns: `repeat(columns, minmax(0, 1fr))`. */
  columns?: number;
  /**
   * Responsive auto mode: `repeat(auto-fill, minmax(minItemWidth, 1fr))`.
   * Takes priority over `columns` when provided.
   */
  minItemWidth?: string;
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  as?: string;
  class?: string;
};

import { gridTemplateColumns } from './grid-layout.js';
defineOptions({ name: 'Grid', inheritAttrs: false });
const props = withDefaults(defineProps<GridProps>(), {
  columns: undefined,
  minItemWidth: undefined,
  gap: undefined,
  as: 'div',
  class: undefined,
});
defineSlots<{ default?: () => unknown }>();
const bindings = computed(() => {
  const style: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: gridTemplateColumns(props.columns, props.minItemWidth),
    gap: spacingToken(props.gap),
  };

  return {  class: classNames('st-grid', props.class), style };
});
</script>

<template>
  <component :is="props.as" v-bind="{ ...$attrs, ...bindings, style: [bindings.style, $attrs.style] }"><slot /></component>
</template>
