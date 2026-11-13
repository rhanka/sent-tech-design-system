<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type NotificationTone = 'info' | 'success' | 'warning' | 'error';

export type NotificationProps = {
  tone?: NotificationTone;
  title: string;
  message?: string;
  dismissible?: boolean;
  dismissLabel?: string;
  locale?: string;
  class?: string;
};

defineOptions({ name: 'Notification', inheritAttrs: false });
const props = withDefaults(defineProps<NotificationProps>(), {
  tone: 'info', message: undefined, dismissible: false, dismissLabel: undefined, locale: 'fr-FR', class: undefined,
});
const emit = defineEmits<{ dismiss: [] }>();

const resolvedDismissLabel = computed(() => props.dismissLabel ?? ((props.locale ?? 'fr-FR').toLowerCase().startsWith('fr') ? 'Fermer' : 'Dismiss'));
const role = computed(() => (props.tone === 'error' ? 'alert' : 'status'));
</script>

<template>
  <section v-bind="$attrs" :class="classNames('st-notification', `st-notification--${props.tone}`, props.class)" :role="role">
    <div class="st-notification__content">
      <h2 class="st-notification__title">{{ props.title }}</h2>
      <p v-if="props.message" class="st-notification__message">{{ props.message }}</p>
      <slot />
    </div>
    <div class="st-notification__meta">
      <div v-if="$slots.actions" class="st-notification__actions"><slot name="actions" /></div>
      <button
        v-if="props.dismissible"
        type="button"
        class="st-notification__close"
        :aria-label="resolvedDismissLabel"
        :title="resolvedDismissLabel"
        @click="emit('dismiss')"
      >×</button>
    </div>
  </section>
</template>
