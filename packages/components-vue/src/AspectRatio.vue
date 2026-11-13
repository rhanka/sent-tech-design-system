<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { normalizeStyle, computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';

export type AspectRatioProps = {
  ratio?: number | string;
  class?: string;
};

defineOptions({ name: 'AspectRatio', inheritAttrs: false });
const props = withDefaults(defineProps<AspectRatioProps>(), {
  ratio: '16 / 9',
  class: undefined,
});
const attrs = useAttrs();
const aspectRatioStyle = computed(() => {
  const aspectRatio = typeof props.ratio === 'number' ? String(props.ratio) : props.ratio;
  return { aspectRatio, ...(normalizeStyle([attrs.style]) as CSSProperties) };
});
</script>

<template>
  <div v-bind="$attrs"
    :class="classNames('st-aspectRatio', props.class)"
    :style="aspectRatioStyle"
  ><slot /></div>
</template>
