<script setup lang="ts">
import { VennChart as DsVennChart, type VennChartArea } from '@sentropic/design-system-vue';
export type VennChartProps = {
  areas: VennChartArea[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'VennChart' });
const props = withDefaults(defineProps<VennChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
</script>

<template>
  <DsVennChart :data="props.areas" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
