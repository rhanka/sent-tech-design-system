<script setup lang="ts">
import { computed } from 'vue';
import { resolveWebFrame, type WebFrameConfig } from '@sentropic/dataviz-core';

export type WebFrameProps = {
  frame: WebFrameConfig;
  class?: string;
};

defineOptions({ name: 'WebFrame' });
const props = withDefaults(defineProps<WebFrameProps>(), { class: undefined });
const resolved = computed(() => resolveWebFrame(props.frame));
</script>

<template>
  <iframe :src="resolved.src" :title="resolved.title" :sandbox="resolved.sandbox" :referrerpolicy="resolved.referrerPolicy" :loading="resolved.loading" :allow="resolved.allow" :class="props.class" />
</template>
