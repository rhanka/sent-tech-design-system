<script setup lang="ts">
import { computed } from 'vue';
import DiagramFlowCard from './DiagramFlowCard.vue';
import DiagramFlowHeader from './DiagramFlowHeader.vue';
import { layoutZone, projectCardProps, projectZoneProps, zoneCollapsedCardProps, firstOverflowDiagnostic, ZONE_GEOMETRY, type DiagramGlyphPaths, type CardLineMeasure } from '@sentropic/diagram-canvas/diagramCardModel';
import type { SceneNodeModel } from '@sentropic/diagram-canvas/diagramSceneModel';
const props = defineProps<{ node: SceneNodeModel; measure: CardLineMeasure; expand: (title: string) => string; collapse: (title: string) => string; resolveGlyph?: (name: string) => DiagramGlyphPaths | undefined; select: () => void; toggle: () => void }>();
const title = computed(() => props.node.presentation?.text.title ?? '');
const context = computed(() => ({ entityId: props.node.entity, ...(props.resolveGlyph === undefined ? {} : { resolveGlyph: props.resolveGlyph }) }));
const card = computed(() => props.node.kind === 'card' ? projectCardProps(props.node.presentation, context.value) : undefined);
const zone = computed(() => {
  const node = props.node;
  if (node.kind !== 'zone') return undefined;
  const projected = projectZoneProps(node.presentation, { ...context.value, collapsed: node.collapsed, toggleLabel: node.collapsed ? props.expand(title.value) : props.collapse(title.value), ...(node.collapsed ? {} : { width: node.rect.width, height: node.rect.height }) });
  if (projected.kind !== 'zone') return undefined;
  const layout = layoutZone(projected.props, props.measure);
  const toggle = { collapsed: node.collapsed, label: projected.props.toggleLabel!, onToggle: props.toggle };
  return { props: projected.props, layout, refused: firstOverflowDiagnostic(layout.diagnostics), header: layout.header, toggle, collapsedCard: { ...zoneCollapsedCardProps(projected.props), toggle } };
});
const offset = (n: number) => `calc(${n}px - var(--st-component-diagramZone-borderWidth, 1.5px))`;
</script>
<template>
  <template v-if="node.kind === 'card'"><DiagramFlowCard v-if="card?.kind === 'card'" :card="card.props" :measure="measure" :select="select" /></template>
  <div v-else-if="node.kind !== 'zone'" class="st-diagramSceneFigure-label" :data-entity="node.entity">{{ node.text }}</div>
  <template v-else-if="zone !== undefined">
    <div v-if="node.collapsed" class="st-diagramZone-pos" style="left:0px;top:0px" :data-entity="node.entity" data-collapsed="true"><DiagramFlowCard :card="zone.collapsedCard" :measure="measure" :select="select" /></div>
    <div v-else class="st-diagramZone-pos" style="left:0px;top:0px" :data-entity="node.entity" data-collapsed="false" :data-zone-refused="zone.refused?.slot" :data-zone-overflow="zone.refused?.slot">
      <div :class="['st-diagramZone', 'st-diagramZone--expanded', zone.refused === undefined ? undefined : 'st-diagramZone--refused', zone.props.align === 'center' ? 'st-diagramZone--center' : undefined, zone.props.proposed ? 'st-diagramZone--proposed' : undefined]" :style="`width:${zone.layout.box.width}px;height:${zone.layout.box.height}px`" role="group" :aria-label="title" :data-tone="zone.props.tone" :data-proposed="zone.props.proposed ? 'true' : undefined" @click="select">
        <template v-if="zone.refused === undefined && zone.header !== undefined">
          <div class="st-diagramZone-header" :style="`top:${offset(ZONE_GEOMETRY.headerInset)};left:${offset(ZONE_GEOMETRY.headerInset)};right:${offset(ZONE_GEOMETRY.contentInsetInline)};height:${zone.header.ruleY - ZONE_GEOMETRY.headerRuleGap - ZONE_GEOMETRY.headerInset}px`"><div class="st-diagramZoneHeader">
            <DiagramFlowHeader :data="zone.header" :card="{ ...zone.props, toggle: zone.toggle }" :toggle-offset="ZONE_GEOMETRY.toggleTopInset - ZONE_GEOMETRY.headerInset" />
            <div v-if="zone.header.subtitle.length > 0" class="st-diagramZoneHeader-subtitle" :style="`width:${zone.header.subtitleWidth}px`"><span v-for="(line, index) in zone.header.subtitle" :key="index" class="st-diagramZone-subtitle">{{ line.text }}</span></div>
          </div></div>
          <div class="st-diagramZone-rule" aria-hidden="true" :style="`left:${offset(ZONE_GEOMETRY.ruleInsetStart)};right:${offset(ZONE_GEOMETRY.ruleInsetEnd)};top:${offset(zone.header.ruleY)}`" />
          <div class="st-diagramZone-content" :style="`top:${offset(zone.header.contentTop)};left:${offset(ZONE_GEOMETRY.contentInsetInline)};right:${offset(ZONE_GEOMETRY.contentInsetInline)};bottom:${offset(ZONE_GEOMETRY.contentInsetBottom)}`" />
          <div v-if="zone.header.footerRuleY !== undefined" class="st-diagramZone-footerRule" aria-hidden="true" :style="`top:${offset(zone.header.footerRuleY)};left:${offset(ZONE_GEOMETRY.ruleInsetStart)};right:${offset(ZONE_GEOMETRY.ruleInsetEnd)}`" />
          <div v-if="zone.header.footer.length > 0" class="st-diagramZone-footer" :style="`left:${offset(ZONE_GEOMETRY.contentInsetInline)};right:${offset(ZONE_GEOMETRY.contentInsetInline)};bottom:var(--st-component-diagramZone-footerBottomInset, var(--st-component-diagramCard-footerBottomInset, 9.25px))`"><span v-for="(line, index) in zone.header.footer" :key="index" class="st-diagramZone-footerLine">{{ line.text }}</span></div>
        </template>
      </div>
    </div>
  </template>
</template>
