<script setup lang="ts">

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

  emit('dismiss', event);
}
</script>

<template>
  <span v-bind="{ ...($attrs), class: (classNames('st-tag', `st-tag--${props.tone}`, `st-tag--${props.size}`, props.disabled && 'st-tag--disabled', props.class)) }"  :aria-disabled="props.disabled ? 'true' : undefined">
    <span class="st-tag__label"><slot /></span>
    <button v-if="props.dismissible" type="button" class="st-tag__dismiss" :aria-label="props.dismissLabel" :disabled="props.disabled" @click="handleDismiss"><svg    aria-hidden="true"  xmlns="http://www.w3.org/2000/svg" :width="14" :height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
  </span>
</template>
