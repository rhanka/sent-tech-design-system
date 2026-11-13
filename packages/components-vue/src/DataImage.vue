<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { StyleValue } from 'vue';
import { classNames } from './classNames.js';

export type DataImageFit = 'cover' | 'contain';

export type DataImageProps = {
  /** Image URL (required). */
  src: string;
  /** Alternative text (required for a11y; pass "" only for purely decorative images). */
  alt: string;
  /** Intrinsic / box width (number → px, or any CSS length). */
  width?: number | string;
  /** Intrinsic / box height (number → px, or any CSS length). */
  height?: number | string;
  /** `object-fit` behaviour inside its box. Default `cover`. */
  fit?: DataImageFit;
  /** Border radius (CSS length). */
  radius?: number | string;
  /** Image loading strategy. Default `lazy`; use `eager` for LCP images. */
  loading?: 'eager' | 'lazy';
  /** Image decoding hint. Default `async`. */
  decoding?: 'async' | 'sync' | 'auto';
  class?: string;
};

const len = (v: number | string | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v;

defineOptions({ name: 'DataImage', inheritAttrs: false });
const props = withDefaults(defineProps<DataImageProps>(), {
  width: undefined,
  height: undefined,
  fit: 'cover',
  radius: undefined,
  loading: 'lazy',
  decoding: 'async',
  class: undefined,
});

const attrs = useAttrs();
const imgStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {};
  const w = len(props.width);
  const ht = len(props.height);
  const r = len(props.radius);
  if (w) style.width = w;
  if (ht) style.height = ht;
  if (r) style.borderRadius = r;
  return style;
});
const rootAttrs = () => {
  const { style: _callerStyle, ...rest } = attrs;
  return rest;
};
</script>

<template>
  <img v-bind="rootAttrs()" :class="classNames('st-dataImage', `st-dataImage--${props.fit}`, props.class)" :src="props.src" :alt="props.alt" :style="[imgStyle, $attrs.style as StyleValue]" :loading="props.loading" :decoding="props.decoding" />
</template>
