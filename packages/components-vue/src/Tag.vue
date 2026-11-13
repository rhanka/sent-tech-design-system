<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { classNames } from './classNames.js';

export type TagTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';
export type TagSize = 'sm' | 'md';

export type TagProps = {
  tone?: TagTone;
  size?: TagSize;
  disabled?: boolean;
  dismissible?: boolean;
  dismissLabel?: string;
  /** Svelte/React-canonical callback; fires alongside the `dismiss` emit. */
  onDismiss?: (event: MouseEvent) => void;
  class?: string;
};

defineOptions({ name: 'Tag', inheritAttrs: false });
const props = withDefaults(defineProps<TagProps>(), {
  tone: 'neutral', size: 'md', disabled: false, dismissible: false, dismissLabel: 'Dismiss',
  onDismiss: undefined, class: undefined,
});
const emit = defineEmits<{ dismiss: [event: MouseEvent] }>();

function handleDismiss(event: MouseEvent) {
  if (props.disabled) return;
  props.onDismiss?.(event);
  emit('dismiss', event);
}
</script>

<template>
  <span v-bind="$attrs" :class="classNames('st-tag', `st-tag--${props.tone}`, `st-tag--${props.size}`, props.disabled && 'st-tag--disabled', props.class)" :aria-disabled="props.disabled ? 'true' : undefined">
    <span class="st-tag__label"><slot /></span>
    <button v-if="props.dismissible" type="button" class="st-tag__dismiss" :aria-label="props.dismissLabel" :disabled="props.disabled" @click="handleDismiss"><X :size="14" :stroke-width="2" aria-hidden="true" /></button>
  </span>
</template>
