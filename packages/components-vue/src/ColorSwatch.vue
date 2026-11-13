<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';


export type ColorSwatchShape = "square" | "circle" | "pill";


export type ColorSwatchProps = {
  color: string;
  size?: number;
  shape?: ColorSwatchShape;
  label?: string;
  class?: string;
};
defineOptions({ name: 'ColorSwatch', inheritAttrs: false });
const props = withDefaults(defineProps<ColorSwatchProps>(), { size: 24, shape: "square", label: undefined, class: undefined });


const safeSize = computed(() => Math.max(Number(props.size ?? 24) || 0, 1));
</script>

<template>
  <span v-bind="$attrs" :class="classNames('st-colorSwatch', `st-colorSwatch--${props.shape ?? 'square'}`, props.class)"><span class="st-colorSwatch__chip" :style="{ background: props.color, width: `${safeSize}px`, height: `${safeSize}px` }" role="img" :aria-label="props.label ?? props.color" /><span v-if="props.label" class="st-colorSwatch__label">{{ props.label }}</span></span>
</template>
