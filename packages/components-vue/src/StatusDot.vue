<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import { classNames } from './classNames.js';


export type StatusDotTone = "neutral" | "info" | "success" | "warning" | "error";


export type StatusDotProps = {
  /** Ton sémantique, mappé sur --st-semantic-feedback-*. Ignoré si `color` est fourni. */
  tone?: StatusDotTone;
  /** Couleur arbitraire (hex, rgb(), var(--token)…), rendue en background inline. Prime sur `tone`. */
  color?: string;
  /** Diamètre du point en px (défaut 8). */
  size?: number;
  /** Halo animé pour un état « live ». Désactivé sous prefers-reduced-motion. */
  pulse?: boolean;
  /** Si fourni, rend le point + ce texte inline (un StatusIndicator). */
  label?: string;
  class?: string;
};
defineOptions({ name: 'StatusDot', inheritAttrs: false });
const props = withDefaults(defineProps<StatusDotProps>(), { tone: "neutral", color: undefined, size: 8, pulse: false, label: undefined, class: undefined });


const safeSize = computed(() => Math.max(Number(props.size ?? 8) || 0, 1));
const dotStyle = computed<CSSProperties>(() => ({ width: `${safeSize.value}px`, height: `${safeSize.value}px`, ...(props.color ? { backgroundColor: props.color } : {}) }));
const dotClasses = computed(() => classNames('st-statusDot__dot', props.color ? undefined : `st-statusDot__dot--${props.tone}`, props.pulse ? 'st-statusDot__dot--pulse' : undefined));
</script>

<template>
  <span v-bind="{ ...($attrs), class: (classNames('st-statusDot', props.class)) }" ><template v-if="props.label"><span :class="dotClasses" :style="dotStyle" aria-hidden="true" /><span class="st-statusDot__label">{{ props.label }}</span></template><span v-else :class="dotClasses" :style="dotStyle" role="img" :aria-label="props.label ?? props.color ?? props.tone" /></span>
</template>
