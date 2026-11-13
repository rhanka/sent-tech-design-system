<script setup lang="ts">
defineOptions({ name: 'GraphLegend' });
import { nodeShapePath, edgeDashArray, type ForceGraphLegendEntry } from '@sentropic/graph/presentation';
defineProps<{
    entries: ForceGraphLegendEntry[];
    title?: string;
    class?: string;
}>();
</script>

<template>
  <div :class="['st-graphLegend', $props.class]" :aria-label="title ?? 'Graph legend'">
    <p v-if="title" class="st-graphLegend__title">{{ title }}</p>
    <ul class="st-graphLegend__list" role="list">
      <li v-for="(entry, index) in entries" :key="index" class="st-graphLegend__entry">
        <svg v-if="entry.shape !== undefined" class="st-graphLegend__swatch" viewBox="-13 -13 26 26" width="16" height="16" aria-hidden="true">
          <path v-if="nodeShapePath(entry.shape, 7)" :d="nodeShapePath(entry.shape, 7)!" :class="`st-graphLegend__shape st-graphLegend__shape--${entry.tone ?? 'category1'}`" />
          <circle v-else r="7" :class="`st-graphLegend__shape st-graphLegend__shape--${entry.tone ?? 'category1'}`" />
        </svg>
        <svg v-else class="st-graphLegend__swatch" viewBox="0 0 16 8" width="16" height="8" aria-hidden="true">
          <line x1="0" y1="4" x2="16" y2="4" :class="['st-graphLegend__edge', { 'st-graphLegend__edge--weak': entry.weak }]" :stroke-dasharray="edgeDashArray(entry.dash, entry.weak) ?? undefined" />
        </svg>
        <span class="st-graphLegend__label">{{ entry.label }}</span>
      </li>
    </ul>
  </div>
</template>
