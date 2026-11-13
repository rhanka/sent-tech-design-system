<script setup lang="ts">
import { computed } from 'vue';
import { resolveDataImage, type DataImageConfig, type Row } from '@sentropic/dataviz-core';

export type DataImageProps = {
  image: DataImageConfig;
  row?: Row;
  class?: string;
};

defineOptions({ name: 'DataImage' });
const props = withDefaults(defineProps<DataImageProps>(), { row: undefined, class: undefined });
const resolved = computed(() => resolveDataImage(props.image, props.row));
</script>

<template>
  <img :src="resolved.src" :alt="resolved.alt" :class="props.class" />
</template>
