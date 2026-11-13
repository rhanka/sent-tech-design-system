<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';
import { spacingToken } from './spacing.js';


export type DividerOrientation = "horizontal" | "vertical";

export type DividerVariant = "solid" | "dashed";


export type DividerProps = {
  orientation?: DividerOrientation;
  /** Spacing scale step (0..12) applied as margin around the divider. */
  spacing?: number;
  /** Optional label centered on a horizontal divider line. */
  label?: string;
  variant?: DividerVariant;
  class?: string;
};
defineOptions({ name: 'Divider', inheritAttrs: false });
const props = withDefaults(defineProps<DividerProps>(), { orientation: "horizontal", spacing: undefined, label: undefined, variant: "solid", class: undefined });


const isVertical = computed(() => props.orientation === 'vertical');
const hasLabel = computed(() => !isVertical.value && props.label != null && props.label !== '');
const margin = computed(() => spacingToken(props.spacing));
const style = computed(() => ({ marginBlock: isVertical.value ? undefined : margin.value, marginInline: isVertical.value ? margin.value : undefined }));
</script>

<template>
  <div v-bind="{ ...$attrs, style: [style, $attrs.style] }" :class="classNames('st-divider', `st-divider--${props.orientation}`, `st-divider--${props.variant}`, hasLabel && 'st-divider--labeled', props.class)" role="separator" :aria-orientation="hasLabel ? 'horizontal' : props.orientation"><template v-if="hasLabel"><span class="st-divider__line" aria-hidden="true" /><span class="st-divider__label">{{ props.label }}</span><span class="st-divider__line" aria-hidden="true" /></template></div>
</template>
