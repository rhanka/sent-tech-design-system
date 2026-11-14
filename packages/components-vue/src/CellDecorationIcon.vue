<script setup lang="ts">
import Icon from './Icon.vue';
import { computed } from 'vue';
import { renderCellDecorationIcon } from './cellDecoration.js';
export type CellDecorationIconProps = { icon?: string };
defineOptions({ name: 'CellDecorationIcon' });
const props = defineProps<CellDecorationIconProps>();
const nodes = computed(() => renderCellDecorationIcon(props.icon));
</script>
<template>
  <Icon v-if="nodes" :glyph="{ nodes: nodes }" class="st-cell__icon" :size="14" />
</template>
