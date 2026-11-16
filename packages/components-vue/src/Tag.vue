<script setup lang="ts">
import Icon from './Icon.vue';

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
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <span v-bind="{ ...($attrs), class: (classNames('st-tag', `st-tag--${props.tone}`, `st-tag--${props.size}`, props.disabled && 'st-tag--disabled', props.class)) }"  :aria-disabled="props.disabled ? 'true' : undefined">
    <span class="st-tag__label"><slot /></span>
    <button v-if="props.dismissible" type="button" class="st-tag__dismiss" :aria-label="props.dismissLabel" :disabled="props.disabled" @click="handleDismiss"><Icon name="x" :size="14" /></button>
  </span>
</template>
