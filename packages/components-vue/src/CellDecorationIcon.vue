<script setup lang="ts">
import { computed } from 'vue';
import { renderCellDecorationIcon } from './cellDecoration.js';
import SvgNodes from './SvgNodes.vue';
export type CellDecorationIconProps = { icon?: string };
defineOptions({ name: 'CellDecorationIcon' });
const props = defineProps<CellDecorationIconProps>();
const nodes = computed(() => renderCellDecorationIcon(props.icon));
</script>
<template>
  <svg v-if="nodes" class="st-cell__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><SvgNodes :nodes="nodes" /></svg>
</template>
