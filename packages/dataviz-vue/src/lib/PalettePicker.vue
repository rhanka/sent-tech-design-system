<script setup lang="ts">
import { computed } from 'vue';
import { buildSequentialScale, buildDivergingScale } from '@sentropic/dataviz-core';
import PaletteScale from './PaletteScale.vue';

export type PalettePickerProps = {
  categorical?: string[];
  sequential?: string[];
  diverging?: string[];
  steps?: number;
  min?: string;
  max?: string;
  swatchSize?: number;
  label?: string;
  class?: string;
};

defineOptions({ name: 'PalettePicker' });
const props = withDefaults(defineProps<PalettePickerProps>(), {
  categorical: undefined, sequential: undefined, diverging: undefined, steps: 9,
  min: undefined, max: undefined, swatchSize: 24, label: undefined, class: undefined,
});
const sequential = computed(() => props.sequential && props.sequential.length >= 2 ? buildSequentialScale(props.sequential, props.steps) : null);
const diverging = computed(() => props.diverging && props.diverging.length >= 3
  ? buildDivergingScale(props.diverging[0]!, props.diverging[Math.floor(props.diverging.length / 2)]!, props.diverging[props.diverging.length - 1]!, props.steps) : null);
const swatchSize = computed(() => Math.max(Number(props.swatchSize ?? 24) || 0, 1));
</script>

<template>
  <div :class="['st-flex', 'st-stack', props.class].filter(Boolean).join(' ')"
    :style="{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', gap: 'var(--st-spacing-3, 0.75rem)' }">
    <div v-if="props.categorical?.length" class="st-flex st-inline"
      :style="{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--st-spacing-1, 0.25rem)' }">
      <span v-for="(color, index) in props.categorical" :key="index" class="st-colorSwatch st-colorSwatch--circle">
        <span class="st-colorSwatch__chip" :style="{ background: color, width: swatchSize + 'px', height: swatchSize + 'px' }" role="img" :aria-label="color" />
      </span>
    </div>
    <PaletteScale v-if="sequential" :colors="sequential" :min="props.min" :max="props.max" :label="props.label ? props.label + ' — séquentiel' : 'Échelle séquentielle'" />
    <PaletteScale v-if="diverging" :colors="diverging" :min="props.min" :max="props.max" :label="props.label ? props.label + ' — divergent' : 'Échelle divergente'" />
  </div>
</template>
