<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import { classNames } from './classNames.js';

export type StatusDotTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

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
const props = withDefaults(defineProps<StatusDotProps>(), {
  tone: 'neutral', color: undefined, size: 8, pulse: false, label: undefined, class: undefined,
});

const safeSize = computed(() => Math.max(Number(props.size ?? 8) || 0, 1));
const accessibleLabel = computed(() => props.label ?? props.color ?? props.tone);
const dotStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    width: `${safeSize.value}px`,
    height: `${safeSize.value}px`,
  };
  if (props.color) {
    style.backgroundColor = props.color;
  }
  return style;
});
const dotClasses = computed(() =>
  classNames(
    'st-statusDot__dot',
    props.color ? undefined : `st-statusDot__dot--${props.tone}`,
    props.pulse ? 'st-statusDot__dot--pulse' : undefined,
  ),
);
</script>

<template>
  <span v-bind="$attrs" :class="classNames('st-statusDot', props.class)">
    <span v-if="props.label" :class="dotClasses" :style="dotStyle" aria-hidden="true" />
    <span v-if="props.label" class="st-statusDot__label">{{ props.label }}</span>
    <span v-else :class="dotClasses" :style="dotStyle" role="img" :aria-label="accessibleLabel" />
  </span>
</template>
