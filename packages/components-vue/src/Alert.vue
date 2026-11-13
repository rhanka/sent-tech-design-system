<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { classNames } from './classNames.js';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export type AlertProps = {
  tone?: AlertTone;
  title?: string | number;
  message?: string | number;
  actions?: string | number;
  class?: string;
};

defineOptions({ name: 'Alert', inheritAttrs: false });
const props = withDefaults(defineProps<AlertProps>(), {
  tone: 'info', message: undefined, actions: undefined, class: undefined,
});
defineSlots<{
  title?: () => unknown;
  message?: () => unknown;
  actions?: () => unknown;
  default?: () => unknown;
}>();
</script>

<template>
  <section
    v-bind="{ ...($attrs), class: (classNames('st-alert', `st-alert--${props.tone}`, props.class)) }"

    :role="props.tone === 'warning' || props.tone === 'error' ? 'alert' : 'status'"
  >
    <div class="st-alert__content">
      <h2 class="st-alert__title"><template v-if="$slots.title"><slot name="title" /></template><template v-else>{{ scalarContent(props.title) }}</template></h2>
      <p v-if="$slots.message || props.message" class="st-alert__message"><template v-if="$slots.message"><slot name="message" /></template><template v-else>{{ scalarContent(props.message) }}</template></p>
      <slot />
    </div>
    <div v-if="$slots.actions || props.actions" class="st-alert__actions"><template v-if="$slots.actions"><slot name="actions" /></template><template v-else>{{ scalarContent(props.actions) }}</template></div>
  </section>
</template>
