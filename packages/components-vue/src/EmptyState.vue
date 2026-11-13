<script setup lang="ts">
import { classNames } from './classNames.js';

export type EmptyStateProps = {
  title: unknown;
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
defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <section v-bind="$attrs" :class="classNames('st-empty-state st-emptyState', props.class)">
    <div class="st-empty-state__content">
      <h2 class="st-empty-state__title st-emptyState__title">{{ props.title }}</h2>
      <p v-if="props.message" class="st-empty-state__message st-emptyState__message">{{ props.message }}</p>
      <slot />
      <div v-if="props.action" class="st-empty-state__action">{{ props.action }}</div>
    </div>
  </section>
</template>
