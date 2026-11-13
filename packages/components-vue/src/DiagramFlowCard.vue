<script setup lang="ts">
import { computed } from 'vue';
import DiagramFlowHeader from './DiagramFlowHeader.vue';
import { layoutCard, firstOverflowDiagnostic, type DiagramCardProps, type CardLineMeasure } from '@sentropic/diagram-canvas/diagramCardModel';
const props = defineProps<{ card: DiagramCardProps; measure: CardLineMeasure; select: () => void }>();
const layout = computed(() => layoutCard(props.card, props.measure));
const refused = computed(() => firstOverflowDiagnostic(layout.value.diagnostics));
</script>
<template>
  <div :class="['st-diagramCard', refused === undefined ? undefined : 'st-diagramCard--refused', card.bodyMode === 'subtitle' ? 'st-diagramCard--subtitle' : undefined, card.align === 'center' ? 'st-diagramCard--center' : undefined, card.proposed ? 'st-diagramCard--proposed' : undefined]"
    :data-entity="card.entityId" :data-tone="card.tone" :data-proposed="card.proposed ? 'true' : undefined" :data-card-refused="refused?.slot" :data-card-overflow="refused?.slot" :data-card-icon-unknown="layout.diagnostics.some(d => d.code === 'card-icon-unknown') ? '' : undefined" role="group" :aria-label="card.title" @click="select">
    <template v-if="refused === undefined">
      <DiagramFlowHeader :data="layout" :card="card" />
      <div class="st-diagramCard-gap" aria-hidden="true" />
      <div class="st-diagramCard-body" :style="`margin-left:${layout.bodyX - 16}px;width:${layout.bodyWidth}px`"><span v-for="(line, index) in layout.body" :key="index" :class="line.secondary ? 'st-diagramCard-detail' : 'st-diagramCard-line'">{{ line.text }}</span></div>
      <div class="st-diagramCard-foot">
        <div v-if="layout.ruleY !== undefined" class="st-diagramCard-rule" aria-hidden="true" />
        <div v-if="layout.footerLines.length > 0" class="st-diagramCard-footer"><span v-for="(line, index) in layout.footerLines" :key="index" class="st-diagramCard-footerLine">{{ line.text }}</span></div>
      </div>
    </template>
  </div>
</template>
