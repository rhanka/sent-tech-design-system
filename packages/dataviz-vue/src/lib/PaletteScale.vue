<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'PaletteScale' });
const props = defineProps<{ colors: string[]; min?: string; max?: string; label: string }>();
const gradient = computed(() => {
  const colors = props.colors ?? [];
  const stops = colors.length >= 2 ? colors : colors.length === 1 ? [colors[0], colors[0]] : [];
  return stops.length ? 'linear-gradient(to right, ' + stops.join(', ') + ')' : 'none';
});
const hasEndLabels = computed(() => props.min !== undefined || props.max !== undefined);
</script>

<template>
  <div class="st-colorScaleBar st-colorScaleBar--horizontal">
    <span v-if="props.label" class="st-colorScaleBar__label">{{ props.label }}</span>
    <div class="st-colorScaleBar__track">
      <span v-if="hasEndLabels" class="st-colorScaleBar__end st-colorScaleBar__end--max">{{ props.max ?? '' }}</span>
      <div class="st-colorScaleBar__bar" :style="{ background: gradient }" role="img" :aria-label="props.label" />
      <span v-if="hasEndLabels" class="st-colorScaleBar__end st-colorScaleBar__end--min">{{ props.min ?? '' }}</span>
    </div>
  </div>
</template>
