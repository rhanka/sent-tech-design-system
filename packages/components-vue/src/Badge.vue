<script setup lang="ts">
import { classNames } from './classNames.js';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type BadgeShape = 'pill' | 'circle';
export type BadgeSize = 'sm' | 'md';
export type BadgeProps = {
  tone?: BadgeTone;
  shape?: BadgeShape;
  size?: BadgeSize;
  class?: string;
};

defineOptions({ name: 'Badge', inheritAttrs: false });
const props = withDefaults(defineProps<BadgeProps>(), {
  tone: 'neutral', shape: 'pill', size: 'md', class: undefined,
});
</script>

<template>
  <span v-bind="$attrs" :class="classNames('st-badge', `st-badge--${props.tone}`, `st-badge--${props.shape}`, `st-badge--${props.size}`, props.class)"><slot /></span>
</template>
