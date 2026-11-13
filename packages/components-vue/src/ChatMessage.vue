<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'tool';
export type ChatMessageStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'idle'
  | 'streaming'
  | 'error'
  | 'sent';

export type ChatMessageProps = {
  role?: ChatMessageRole;
  status?: ChatMessageStatus;
  content?: unknown;
  timestamp?: unknown;
  footer?: unknown;
  actions?: unknown;
  avatar?: unknown;
  class?: string;
};

defineOptions({ name: 'ChatMessage', inheritAttrs: false });
const props = withDefaults(defineProps<ChatMessageProps>(), {
  role: 'assistant',
  status: 'completed',
  content: undefined,
  timestamp: undefined,
  footer: undefined,
  actions: undefined,
  avatar: undefined,
  class: undefined,
});
defineSlots<{timestamp?: () => unknown;
  content?: () => unknown;
  default?: () => unknown;
  avatar?: () => unknown;
  footer?: () => unknown;
  actions?: () => unknown;
}>();

const role = computed(() => props.role ?? 'assistant');
const normalizedStatus = computed(() => {
  const status = props.status;
  if (status === 'idle' || status === 'streaming') return 'processing';
  if (status === 'error') return 'failed';
  return status;
});
const isStreaming = computed(() => normalizedStatus.value === 'processing');
const alignment = computed(() => (role.value === 'user' ? 'end' : 'start'));
</script>

<template>
  <article
    v-bind="{ ...($attrs), class: (classNames(
      'st-chatMessage',
      `st-chatMessage--${role}`,
      normalizedStatus && `st-chatMessage--${normalizedStatus}`,
      props.class,
    )) }"

    :data-role="role"
    :data-status="normalizedStatus"
    :data-align="alignment"
    :aria-live="isStreaming ? 'polite' : undefined"
  >
    <div v-if="$slots.avatar || props.avatar" class="st-chatMessage__avatar" aria-hidden="true">
      <template v-if="$slots.avatar"><slot name="avatar" /></template>
      <template v-else>{{ scalarContent(props.avatar) }}</template>
    </div>
    <div class="st-chatMessage__body">
      <div class="st-chatMessage__bubble">
        <div class="st-chatMessage__content"><slot name="content"><slot>{{ scalarContent(props.content) }}</slot></slot></div>
        <span v-if="isStreaming" class="st-chatMessage__pulse" aria-hidden="true" />
      </div>
      <div v-if="$slots.footer || props.footer || props.timestamp || $slots.timestamp" class="st-chatMessage__footer">
        <template v-if="$slots.footer || props.footer">
          <template v-if="$slots.footer"><slot name="footer" /></template>
          <template v-else>{{ scalarContent(props.footer) }}</template>
        </template>
        <span v-else class="st-chatMessage__timestamp"><slot name="timestamp">{{ scalarContent(props.timestamp) }}</slot></span>
      </div>
      <div v-if="$slots.actions || props.actions" class="st-chatMessage__actions">
        <template v-if="$slots.actions"><slot name="actions" /></template>
        <template v-else>{{ scalarContent(props.actions) }}</template>
      </div>
    </div>
  </article>
</template>
