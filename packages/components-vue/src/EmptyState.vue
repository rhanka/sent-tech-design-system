<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { classNames } from './classNames.js';

export type EmptyStateProps = {
  title?: unknown;
  message?: unknown;
  action?: unknown;
  class?: string;
};

defineOptions({ name: 'EmptyState', inheritAttrs: false });
const props = withDefaults(defineProps<EmptyStateProps>(), {
  message: undefined,
  action: undefined,
  class: undefined,
});
defineSlots<{ default?: () => unknown; title?: () => unknown; message?: () => unknown; action?: () => unknown }>();
</script>

<template>
  <section v-bind="{ ...($attrs), class: (classNames('st-empty-state st-emptyState', props.class)) }" >
    <div class="st-empty-state__content">
      <h2 v-if="$slots.title || props.title != null" class="st-empty-state__title st-emptyState__title"><slot name="title">{{ scalarContent(props.title) }}</slot></h2>
      <p v-if="$slots.message || props.message" class="st-empty-state__message st-emptyState__message"><slot name="message">{{ scalarContent(props.message) }}</slot></p>
      <slot />
      <div v-if="$slots.action || props.action" class="st-empty-state__action"><slot name="action">{{ scalarContent(props.action) }}</slot></div>
    </div>
  </section>
</template>
