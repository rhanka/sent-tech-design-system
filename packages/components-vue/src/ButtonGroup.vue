<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import { classNames } from './classNames.js';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';
export type ButtonGroupSize = 'sm' | 'md' | 'lg';

export type ButtonGroupProps = {
  orientation?: ButtonGroupOrientation;
  /** Look segmenté joint (boutons collés, coins arrondis seulement aux extrémités). */
  attached?: boolean;
  /** Espacement entre boutons (échelle spacing), ignoré quand `attached`. */
  gap?: number;
  /** Taille indicative (transmise via data-attr pour styliser les enfants si besoin). */
  size?: ButtonGroupSize;
  /** Étiquette a11y du groupe. */
  label?: string;
  class?: string;
};

defineOptions({ name: 'ButtonGroup', inheritAttrs: false });
const props = withDefaults(defineProps<ButtonGroupProps>(), {
  orientation: 'horizontal',
  attached: false,
  gap: undefined,
  size: 'md',
  label: undefined,
  class: undefined,
});
const groupStyle = computed<CSSProperties | string | undefined>(() => {
  const gapValue =
    props.attached || props.gap == null
      ? undefined
      : `var(--st-spacing-${props.gap}, ${props.gap * 0.25}rem)`;
  return gapValue != null
    ? { gap: gapValue }
    : undefined;
});
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <div v-bind="{ ...$attrs, style: [groupStyle, $attrs.style] }"
    :class="classNames(
      'st-buttonGroup',
      `st-buttonGroup--${props.orientation}`,
      props.attached && 'st-buttonGroup--attached',
      props.class,
    )"
    role="group"
    :aria-label="props.label"
    :data-size="props.size"
  ><slot /></div>
</template>
