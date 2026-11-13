<script setup lang="ts">
import { computed } from 'vue';
import DiagramCard from './DiagramCard.vue';
import DiagramZone from './DiagramZone.vue';
import { projectCardProps, projectZoneProps, type DiagramGlyphPaths, type CardLineMeasure } from '@sentropic/diagram-canvas/diagramCardModel';
import type { SceneNodeModel } from '@sentropic/diagram-canvas/diagramSceneModel';
const props = defineProps<{ node: SceneNodeModel; measure: CardLineMeasure; expand: (title: string) => string; collapse: (title: string) => string; resolveGlyph?: (name: string) => DiagramGlyphPaths | undefined; select: () => void; toggle: () => void }>();
const context = computed(() => ({ entityId: props.node.entity, ...(props.resolveGlyph === undefined ? {} : { resolveGlyph: props.resolveGlyph }) }));
const card = computed(() => props.node.kind === 'card' ? projectCardProps(props.node.presentation, context.value) : undefined);
const zone = computed(() => {
  const node = props.node;
  if (node.kind !== 'zone') return undefined;
  const title = node.presentation?.text.title ?? '';
  return projectZoneProps(node.presentation, { ...context.value, collapsed: node.collapsed,
    toggleLabel: node.collapsed ? props.expand(title) : props.collapse(title),
    ...(node.collapsed ? {} : { width: node.rect.width, height: node.rect.height }) });
});
</script>
<template>
  <DiagramCard v-if="card?.kind === 'card'" v-bind="card.props" :measure="measure" @select="select" />
  <DiagramZone v-else-if="zone?.kind === 'zone'" v-bind="zone.props" :measure="measure" @select="select" @toggle="toggle" />
  <div v-else class="st-diagramSceneFigure-label" :data-entity="node.entity">{{ node.text }}</div>
</template>
