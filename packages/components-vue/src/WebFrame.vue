<script setup lang="ts">
import { computed } from 'vue';
import { resolveWebFrame, type WebFrameConfig } from '@sentropic/dataviz-core';

export type WebFrameProps = {
  frame: WebFrameConfig;
  class?: string;
};

defineOptions({ name: 'WebFrame', inheritAttrs: false });
const props = defineProps<WebFrameProps>();
const frameAttrs = computed(() => {
  const resolved = resolveWebFrame(props.frame);
  return { src: resolved.src, title: resolved.title, sandbox: resolved.sandbox,
    referrerpolicy: resolved.referrerPolicy, loading: resolved.loading, allow: resolved.allow,
    ...(props.class === undefined ? {} : { class: props.class }) };
});
</script>

<template>
  <iframe v-bind="frameAttrs"></iframe>
</template>
