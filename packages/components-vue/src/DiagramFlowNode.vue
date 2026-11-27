<script setup lang="ts">
import { computed } from 'vue';
import DiagramErdNode from './DiagramErdNode.vue';
import DiagramProcessNode from './DiagramProcessNode.vue';
import DiagramCard from './DiagramCard.vue';
import DiagramZone from './DiagramZone.vue';
import { projectCardProps, projectZoneProps, type DiagramGlyphPaths, type CardLineMeasure } from '@sentropic/diagram-canvas/diagramCardModel';
import { connectorDashPaint, linkLegendSwatchGeometry, type SceneNodeModel } from '@sentropic/diagram-canvas/diagramSceneModel';
const props = defineProps<{ node: SceneNodeModel; measure: CardLineMeasure; containerPadding?: number; hideToggle?: boolean; linkWidths?: { linkStrokeWidth?: number; linkRelatedStrokeWidth?: number; linkEmphasisStrokeWidth?: number }; expand: (title: string) => string; collapse: (title: string) => string; resolveGlyph?: (name: string) => DiagramGlyphPaths | undefined; select: () => void; toggle: () => void }>();
const context = computed(() => ({ entityId: props.node.entity, ...(props.resolveGlyph === undefined ? {} : { resolveGlyph: props.resolveGlyph }) }));
const card = computed(() => props.node.kind === 'card' ? projectCardProps(props.node.presentation, context.value) : undefined);
const zone = computed(() => {
  const node = props.node;
  if (node.kind !== 'zone') return undefined;
  const title = node.presentation?.text.title ?? '';
  return projectZoneProps(node.presentation, { ...context.value, containerPadding: props.containerPadding, collapsed: node.collapsed,
    ...(props.hideToggle ? {} : { toggleLabel: node.collapsed ? props.expand(title) : props.collapse(title) }),
    ...(node.collapsed ? {} : { width: node.rect.width, height: node.rect.height }) });
});
</script>
<template>
  <DiagramErdNode v-if="node.kind === 'erd' && node.erd" :node="node" :expand="expand" :collapse="collapse" :toggle="toggle" />
  <DiagramProcessNode v-else-if="node.kind === 'process' && node.processBox" :node="node" />
  <DiagramCard v-else-if="card?.kind === 'card'" v-bind="card.props" :measure="measure" @select="select" />
  <template v-else-if="zone?.kind === 'zone'">
    <DiagramZone v-bind="zone.props" :measure="measure" @select="select" @toggle="toggle" />
    <div
      v-if="node.combinedLegend !== undefined"
      class="st-diagramSceneFigure-authoredCombined"
      :style="`top:${node.combinedLegend.topOffset - node.combinedLegend.rowGap}px;left:${node.combinedLegend.padding}px;right:${node.combinedLegend.padding}px;--st-diagram-legend-header-gap:${node.combinedLegend.headerGap}px;--st-diagram-legend-row-height:${node.combinedLegend.rowHeight}px;--st-diagram-legend-row-gap:${node.combinedLegend.rowGap}px;--st-diagram-legend-swatch-width:${node.combinedLegend.swatchWidth}px;--st-diagram-legend-swatch-height:${node.combinedLegend.swatchHeight}px;--st-diagram-legend-swatch-gap:${node.combinedLegend.swatchGap}px;--st-diagram-legend-font-size:${node.combinedLegend.fontSize}px`"
    >
      <ul class="st-diagramSceneFigure-legendList">
        <li
          v-for="row in node.combinedLegend.entries.map(entry => ({ entry, swatch: linkLegendSwatchGeometry(entry, linkWidths) }))"
          :key="row.entry.key"
          class="st-diagramSceneFigure-legendItem"
          :data-legend-style="row.entry.key"
          :data-edge-stroke="row.entry.strokeStyle"
          :data-edge-arrowhead="row.entry.arrowhead"
          :data-edge-emphasis="row.entry.emphasis"
        >
          <svg class="st-diagramSceneFigure-legendSwatch" :viewBox="row.swatch.viewBox" aria-hidden="true">
            <path :data-legend-swatch="row.entry.key" :d="row.swatch.linePath" fill="none" :stroke="row.swatch.stroke" :stroke-width="row.swatch.strokeWidth" :stroke-dasharray="row.swatch.dashArray" :style="connectorDashPaint(row.entry.strokeStyle)" vector-effect="non-scaling-stroke" />
            <path v-if="row.swatch.arrowPath !== undefined" :d="row.swatch.arrowPath" :fill="row.swatch.arrowFill" :stroke="row.swatch.arrowStroke" :stroke-width="row.swatch.arrowStrokeWidth" />
          </svg>
          <span class="st-diagramSceneFigure-legendLabel">{{ row.entry.label }}</span>
        </li>
        <li v-for="mark in node.combinedLegend.entityMarks ?? []" :key="mark.kind" class="st-diagramSceneFigure-legendItem" :data-legend-mark="mark.kind">
          <svg class="st-diagramSceneFigure-legendSwatch" :viewBox="`0 0 ${node.combinedLegend.swatchWidth} ${node.combinedLegend.swatchHeight}`" aria-hidden="true">
            <rect v-if="mark.kind === 'proposed'" x="10" y="1" width="24" height="14" rx="4" fill="none" stroke="var(--st-semantic-border-strong, #64748b)" stroke-width="1.5" stroke-dasharray="4 3" />
            <template v-else>
              <rect x="12" y="1" width="20" height="14" rx="3" fill="var(--st-semantic-surface-subtle, #f8fafc)" stroke="var(--st-semantic-border-strong, #64748b)" stroke-width="1.5" />
              <text x="22" y="12" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">+</text>
            </template>
          </svg>
          <span class="st-diagramSceneFigure-legendLabel">{{ mark.label }}</span>
        </li>
      </ul>
    </div>
  </template>
  <div v-else-if="node.kind === 'legend-key' && node.swatch !== undefined" class="st-diagramSceneFigure-label st-diagramSceneFigure-legendKey" :data-entity="node.entity">
    <span class="st-diagramSceneFigure-legendKeySwatch" data-legend-key-swatch="" :style="`background:${node.swatch.fill};border-color:${node.swatch.stroke}`" aria-hidden="true"></span>
    <span class="st-diagramSceneFigure-legendKeyText">{{ node.text }}</span>
  </div>
  <div v-else class="st-diagramSceneFigure-label" :data-entity="node.entity">{{ node.text }}</div>
</template>
