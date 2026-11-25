<script setup lang="ts">
import { computed } from 'vue';
import { renderProcessBoxSvg } from '@sentropic/diagram-canvas';
import type { SceneNodeModel } from '@sentropic/diagram-canvas/diagramSceneModel';
const props = defineProps<{ node: SceneNodeModel }>();
const svg = computed(() => {
  const box = props.node.processBox;
  if (box === undefined) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="st-diagramProcessCard" aria-hidden="true" width="100%" height="100%" viewBox="0 0 ${box.width} ${box.height}" style="font-family:var(--st-font-sans, Inter, system-ui, sans-serif)">${renderProcessBoxSvg(box)}</svg>`;
});
</script>
<template>
  <div v-if="node.processBox" class="st-diagramProcess-svg" v-html="svg" />
</template>
<style>
  .st-diagramProcess-svg { height: 100%; width: 100%; }
</style>
