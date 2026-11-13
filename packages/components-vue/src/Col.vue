<script setup lang="ts">
import { normalizeStyle, computed, useAttrs } from 'vue';
import type { CSSProperties } from 'vue';
import { classNames } from './classNames.js';
export type ColSpan = number | 'auto';
export type ColProps = {
  /** Number of 12-grid columns to span, or "auto" to size to content. */
  span?: ColSpan;
  /** Columns to offset (0..11) via margin-inline-start. */
  offset?: number;
  /** Responsive overrides applied at and above the breakpoint. */
  sm?: ColSpan;
  md?: ColSpan;
  lg?: ColSpan;
  as?: string;
  class?: string;
};

import { spanBasis, offsetMargin } from './col-layout.js';
defineOptions({ name: 'Col', inheritAttrs: false });
const props = withDefaults(defineProps<ColProps>(), {
  span: 'auto',
  offset: 0,
  sm: undefined,
  md: undefined,
  lg: undefined,
  as: 'div',
  class: undefined,
});
defineSlots<{ default?: () => unknown }>();
const attrs = useAttrs();
const bindings = computed(() => {
  const isAuto = props.span === 'auto';
  const basis = spanBasis(props.span);
  const style = {
    flexBasis: basis,
    maxInlineSize: isAuto ? undefined : basis,
    flexGrow: isAuto ? 1 : 0,
    marginInlineStart: offsetMargin(props.offset),
    '--st-col-sm': spanBasis(props.sm),
    '--st-col-md': spanBasis(props.md),
    '--st-col-lg': spanBasis(props.lg),
    ...(normalizeStyle([attrs.style]) as CSSProperties),
  } as CSSProperties;

  return {

    class: classNames(
      'st-col',
      isAuto && 'st-col--auto',
      props.sm != null && 'st-col--has-sm',
      props.md != null && 'st-col--has-md',
      props.lg != null && 'st-col--has-lg',
      props.class,
    ),
    style,
  };
});
</script>

<template>
  <component :is="props.as" v-bind="{ ...$attrs, ...bindings }"><slot /></component>
</template>
