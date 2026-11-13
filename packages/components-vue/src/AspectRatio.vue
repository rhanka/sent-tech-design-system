<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';

export type AspectRatioProps = {
  ratio?: number | string;
  class?: string;
};

defineOptions({ name: 'AspectRatio' });
const props = withDefaults(defineProps<AspectRatioProps>(), {
  ratio: '16 / 9',
  class: undefined,
});
const attrs = useAttrs();
const aspectRatioStyle = computed(() => {
  const aspectRatio = typeof props.ratio === 'number' ? String(props.ratio) : props.ratio;
  return { aspectRatio, ...(attrs.style as object | undefined) };
});
</script>

<template>
  <div
    :class="classNames('st-aspectRatio', props.class)"
    :style="aspectRatioStyle"
  ><slot /></div>
</template>
