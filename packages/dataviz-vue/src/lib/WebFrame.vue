<script setup lang="ts">
import { WebFrame as DsWebFrame } from '@sentropic/design-system-vue';
import type { WebFrameConfig } from '@sentropic/dataviz-core';

export type WebFrameProps = {
  frame: WebFrameConfig;
  class?: string;
};

defineOptions({ name: 'WebFrame', inheritAttrs: false });
const props = withDefaults(defineProps<WebFrameProps>(), { class: undefined });
</script>

<template>
  <DsWebFrame v-bind="$attrs" :frame="props.frame" :class="props.class" />
</template>
