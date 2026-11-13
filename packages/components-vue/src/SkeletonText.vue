<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type SkeletonTextProps = {
  lines?: number;
  width?: string;
  heading?: boolean;
  paragraph?: boolean;
  locale?: string;
  loadingLabel?: string;
  class?: string;
};

defineOptions({ name: 'SkeletonText', inheritAttrs: false });
const props = withDefaults(defineProps<SkeletonTextProps>(), {
  lines: 1, width: undefined, heading: false, paragraph: false, locale: 'fr-FR',
  loadingLabel: undefined, class: undefined,
});

const isFr = computed(() => (props.locale ?? 'fr-FR').toLowerCase().startsWith('fr'));
const resolvedLoadingLabel = computed(() => props.loadingLabel ?? (isFr.value ? 'Chargement…' : 'Loading…'));
const lineCount = computed(() => (props.paragraph ? Math.max(props.lines ?? 1, 3) : props.lines ?? 1));
const lineIndices = computed(() => Array.from({ length: lineCount.value }, (_, i) => i));

function lineWidth(index: number): string | undefined {
  if (props.width && index === 0) return props.width;
  if (props.paragraph && index === lineCount.value - 1) return '60%';
  return undefined;
}
</script>

<template>
  <div
    v-bind="$attrs"
    :class="classNames('st-skeleton', props.class)"
    role="status"
    :aria-label="resolvedLoadingLabel"
    aria-busy="true"
  >
    <span
      v-for="index in lineIndices"
      :key="index"
      :class="classNames('st-skeleton__line', props.heading && 'st-skeleton__line--heading')"
      :style="lineWidth(index) ? `width:${lineWidth(index)}` : undefined"
    />
  </div>
</template>
