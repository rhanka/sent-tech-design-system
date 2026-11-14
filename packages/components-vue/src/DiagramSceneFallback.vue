<script setup lang="ts">
import { computed } from 'vue';
import { renderErdTable } from '@sentropic/diagram-canvas';
import { sceneTextRows, type SceneModel, type DiagramSceneFigureProps } from '@sentropic/diagram-canvas/diagramSceneModel';
const props = defineProps<{ scene: SceneModel | undefined; document: DiagramSceneFigureProps['document'] }>();
const erdTable = computed(() => props.document.profileRefs.includes('erd@1') ? renderErdTable(props.document) : '');
</script>
<template>
  <div v-if="scene" class="st-diagramSceneFigure-fallback"><p v-for="(row, i) in sceneTextRows(scene, document)" :key="i">{{ row }}</p></div>
  <div v-if="erdTable" class="st-diagramErd-fallback" v-html="erdTable" />
</template>
<style>
  .st-diagramSceneFigure-fallback { position: absolute; width: var(--st-component-diagramCard-ruleHeight, 1px); height: var(--st-component-diagramCard-ruleHeight, 1px); padding: 0; margin: calc(-1 * var(--st-component-diagramCard-ruleHeight, 1px)); overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .st-diagramSceneFigure-edgeLabel[data-erd-label] { background: var(--st-semantic-surface-default); }
  .st-diagramErd-fallback { grid-column: 1 / -1; overflow: auto; color: var(--st-semantic-text-primary); }
</style>
