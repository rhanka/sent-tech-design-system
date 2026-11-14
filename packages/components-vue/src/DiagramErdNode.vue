<script setup lang="ts">
import { renderErdCardSvg } from '@sentropic/diagram-canvas';
import type { SceneNodeModel } from '@sentropic/diagram-canvas/diagramSceneModel';
defineProps<{ node: SceneNodeModel; expand: (title: string) => string; collapse: (title: string) => string; toggle: () => void }>();
</script>
<template>
  <template v-if="node.erd">
    <button class="st-diagramErd-toggle" type="button" :aria-label="node.collapsed ? expand(node.erd.title) : collapse(node.erd.title)" :aria-expanded="!node.collapsed" :style="`--st-erd-header-height: ${node.erd.headerHeight}px`" @click="toggle">{{ node.erd.title }}</button>
    <div class="st-diagramErd-svg" v-html="renderErdCardSvg(node.erd)" />
  </template>
</template>
<style>
  .st-diagramErd-toggle { position: absolute; inset: 0 0 auto; height: var(--st-erd-header-height); width: 100%; background: transparent; border: 0; color: transparent; cursor: pointer; }
  .st-diagramErd-svg { height: 100%; width: 100%; }
  .st-diagramErd-toggle:focus-visible { outline: var(--st-component-diagramErd-strokeWidth) solid var(--st-semantic-border-interactive); outline-offset: calc(-1 * var(--st-component-diagramErd-strokeWidth)); }
</style>
