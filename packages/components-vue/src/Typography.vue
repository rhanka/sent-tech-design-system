<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'overline';

export type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TypographyTone = 'primary' | 'secondary' | 'muted' | 'inverse' | 'link';
export type TypographyAlign = 'start' | 'center' | 'end' | 'justify';

/** Balise HTML par défaut pour chaque variante. */
const VARIANT_TAG: Record<TypographyVariant, string> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  overline: 'span',
};

export type TypographyProps = {
  variant?: TypographyVariant;
  /** Surcharge la balise déduite de la variante. */
  as?: string;
  weight?: TypographyWeight;
  tone?: TypographyTone;
  align?: TypographyAlign;
  /** Tronque sur une ligne avec ellipsis. */
  truncate?: boolean;
  class?: string;
};

defineOptions({ name: 'Typography', inheritAttrs: false });
const props = withDefaults(defineProps<TypographyProps>(), {
  variant: 'body', as: undefined, weight: undefined, tone: undefined,
  align: undefined, truncate: false, class: undefined,
});
defineSlots<{ default?: () => unknown }>();

const tag = computed(() => props.as ?? VARIANT_TAG[props.variant]);
const classes = computed(() => classNames(
  'st-typography',
  `st-typography--${props.variant}`,
  props.weight && `st-typography--weight-${props.weight}`,
  props.tone && `st-typography--tone-${props.tone}`,
  props.align && `st-typography--align-${props.align}`,
  props.truncate && 'st-typography--truncate',
  props.class,
));
</script>

<template>
  <component :is="tag" v-bind="$attrs" :class="classes"><slot /></component>
</template>
