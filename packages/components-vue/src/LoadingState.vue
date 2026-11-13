<script setup lang="ts">
import { classNames } from './classNames.js';

export type LoadingStateVariant = 'spinner' | 'skeleton';

export type LoadingStateProps = {
  label?: unknown;
  title?: unknown;
  variant?: LoadingStateVariant;
  class?: string;
};

defineOptions({ name: 'LoadingState', inheritAttrs: false });
const props = withDefaults(defineProps<LoadingStateProps>(), {
  label: undefined, title: undefined, variant: 'spinner', class: undefined,
});
defineSlots<{ label?: () => unknown; title?: () => unknown }>();
</script>

<template>
  <section v-bind="$attrs" :class="classNames('st-loading', `st-loading--${props.variant}`, props.class)" aria-live="polite">
    <span class="st-loading__spinner" aria-hidden="true"></span>
    <span class="st-loading__label"><template v-if="$slots.label"><slot name="label" /></template><template v-else-if="$slots.title"><slot name="title" /></template><template v-else>{{ props.label ?? props.title ?? 'Loading' }}</template></span>
  </section>
</template>
