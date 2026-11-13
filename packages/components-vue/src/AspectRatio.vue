<script setup lang="ts">
import { computed } from 'vue';
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
const aspectRatioStyle = computed(() => {
  const aspectRatio = typeof props.ratio === 'number' ? String(props.ratio) : props.ratio;
  return { aspectRatio };
});
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <div v-bind="{ ...$attrs, style: [aspectRatioStyle, $attrs.style] }"
    :class="classNames('st-aspectRatio', props.class)"
  ><slot /></div>
</template>
