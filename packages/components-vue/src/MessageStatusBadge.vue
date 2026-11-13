<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';
import type { ChatMessageStatus } from './ChatMessage.vue';

export type MessageStatusBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export type MessageStatusBadgeProps = {
  status: ChatMessageStatus;
  tone?: MessageStatusBadgeTone;
  /** @slot label */
  labels?: Partial<Record<ChatMessageStatus, unknown>>;
  class?: string;
};

defineOptions({ name: 'MessageStatusBadge', inheritAttrs: false });
const props = withDefaults(defineProps<MessageStatusBadgeProps>(), {
  tone: undefined, labels: undefined, class: undefined,
});
defineSlots<{ label?: (scope: { status: ChatMessageStatus; label: unknown }) => unknown }>();

const normalized = computed(() =>
  props.status === 'sent' ? 'completed'
  : props.status === 'streaming' ? 'processing'
  : props.status === 'error' ? 'failed'
  : props.status,
);
const resolvedTone = computed<MessageStatusBadgeTone>(() =>
  props.tone ??
  (normalized.value === 'completed' ? 'success'
  : normalized.value === 'failed' ? 'error'
  : normalized.value === 'processing' ? 'info'
  : 'neutral'),
);
const label = computed(() =>
  (props.labels?.[props.status] ?? props.labels?.[normalized.value as ChatMessageStatus])
  ?? (normalized.value.charAt(0).toUpperCase() + normalized.value.slice(1)),
);
</script>

<template>
  <span v-bind="{ ...($attrs), class: (classNames('st-messageStatusBadge', `st-badge st-badge--${resolvedTone}`, props.class)) }" >
    <span class="st-messageStatusBadge__dot" aria-hidden="true" /><slot name="label" :status="props.status" :label="label">{{ scalarContent(label) }}</slot>
  </span>
</template>
