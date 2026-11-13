<script setup lang="ts">
import DiagramControlGlyph from './DiagramControlGlyph.vue';
import type { DiagramCardProps, LaidOutLine } from '@sentropic/diagram-canvas/diagramCardModel';
defineProps<{
  data: { kicker: readonly LaidOutLine[]; title: readonly LaidOutLine[]; headerTextWidth: number; headerBlockHeight: number };
  card: Pick<DiagramCardProps, 'icon' | 'iconGlyph' | 'toggle'>;
  toggleOffset?: number;
}>();
</script>
<template>
  <div class="st-diagramCardHeader" :style="`height:${data.headerBlockHeight}px`">
    <svg v-if="card.icon !== undefined && card.iconGlyph !== undefined" class="st-diagramCardHeader-icon" :data-diagram-icon="card.icon" viewBox="0 0 64 64" width="70" height="70" aria-hidden="true" focusable="false">
      <path d="M8 53L32 44L56 53L32 62Z" fill="var(--st-component-diagramIcon-baseFill)" />
      <path :d="card.iconGlyph.face" fill="var(--st-component-diagramIcon-faceFill)" stroke="var(--st-component-diagramIcon-faceStroke)" stroke-width="1.5" stroke-linejoin="round" />
      <path v-if="card.iconGlyph.line !== undefined" :d="card.iconGlyph.line" fill="none" :stroke="card.iconGlyph.darkLine ? 'var(--st-component-diagramIcon-lineDarkStroke)' : 'var(--st-component-diagramIcon-lineStroke)'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <text v-if="card.iconGlyph.text !== undefined" x="32" y="47" text-anchor="middle" fill="var(--st-component-diagramIcon-lineStroke)" font-size="13" font-weight="750">{{ card.iconGlyph.text }}</text>
    </svg>
    <div class="st-diagramCardHeader-text" :style="`width:${data.headerTextWidth}px`">
      <span v-for="(line, index) in data.kicker" :key="`k:${index}`" class="st-diagramCard-kicker">{{ line.text }}</span>
      <span v-for="(line, index) in data.title" :key="`t:${index}`" class="st-diagramCard-title">{{ line.text }}</span>
    </div>
    <div v-if="card.toggle !== undefined" class="st-diagramCard-toggle" :style="toggleOffset === undefined ? undefined : `margin-top:${toggleOffset}px`">
      <button type="button" class="st-iconButton st-iconButton--sm st-iconButton--ghost" :aria-label="card.toggle.label" :aria-expanded="!card.toggle.collapsed" @click="card.toggle.onToggle">
        <DiagramControlGlyph :plus="card.toggle.collapsed" :style="{ width: 'var(--st-component-button-anatomy-density-sm-fontSize)', height: 'var(--st-component-button-anatomy-density-sm-fontSize)' }" />
      </button>
    </div>
  </div>
</template>
