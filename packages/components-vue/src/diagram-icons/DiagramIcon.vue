<script setup lang="ts">
defineOptions({ name: 'DiagramIcon' });
import { computed, watchEffect } from "vue";
import { DIAGRAM_GLYPHS, DIAGRAM_GLYPH_VIEWBOX, getDiagramGlyph } from "./registry.js";
interface DiagramIconProps {
    /** A §9 glyph name. An unmapped name draws nothing (DIF-14). */
    name: string;
    /** Square box in px the 64-unit viewBox scales into. Default 70. */
    size?: number;
    class?: string;
}
const { name, size = 70, class: className } = defineProps<DiagramIconProps>();
const glyph = computed(() => getDiagramGlyph(name));
</script>

<template>
<template v-if="glyph">
  <svg :class="['st-diagramIcon', className].filter(Boolean).join(' ')" :data-diagram-icon="name" :viewBox="DIAGRAM_GLYPH_VIEWBOX" :width="size" :height="size" aria-hidden="true" focusable="false">
    <path class="st-diagramIcon-base" :d="glyph.base" fill="var(--st-component-diagramIcon-baseFill, color-mix(in srgb, var(--st-semantic-feedback-info) 18%, var(--st-semantic-surface-raised)))"></path>
    <path class="st-diagramIcon-face" :d="glyph.face" fill="var(--st-component-diagramIcon-faceFill, color-mix(in srgb, var(--st-semantic-feedback-info) 75%, var(--st-semantic-surface-raised)))" stroke="var(--st-component-diagramIcon-faceStroke, var(--st-semantic-feedback-info))" stroke-width="1.5" stroke-linejoin="round"></path>
    <template v-if="glyph.line">
      <path class="st-diagramIcon-line" :d="glyph.line" fill="none" :stroke="glyph.darkLine
          ? 'var(--st-component-diagramIcon-lineDarkStroke, var(--st-semantic-feedback-info))'
          : 'var(--st-component-diagramIcon-lineStroke, var(--st-semantic-surface-raised))'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="{ 'st-diagramIcon-line--dark': glyph.darkLine }"></path>
    </template>
    <template v-if="glyph.text">
      <text x="32" y="47" text-anchor="middle" fill="var(--st-component-diagramIcon-lineStroke, var(--st-semantic-surface-raised))" font-size="13" font-weight="750">{{ glyph.text }}</text>
    </template>
  </svg>
</template>
</template>
