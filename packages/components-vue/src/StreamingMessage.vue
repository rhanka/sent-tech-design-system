<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed } from 'vue';
import { classNames } from './classNames.js';
import type { ChatMessageStatus } from './ChatMessage.vue';

export type StreamingMessageEvent = {
  id: string;

  /** @slot event-label */
  label?: unknown;

  /** @vaporData Reserved event metadata; the original renders only label. */
  text?: unknown;
  status?: ChatMessageStatus;
};
export type StreamingMessageMode = 'live' | 'passive';

export type StreamingMessageProps = {
  text?: unknown;
  events?: StreamingMessageEvent[];
  mode?: StreamingMessageMode;
  placeholder?: unknown;
  class?: string;
};

defineOptions({ name: 'StreamingMessage', inheritAttrs: false });
const props = withDefaults(defineProps<StreamingMessageProps>(), {
  text: undefined, events: () => [], mode: 'live', placeholder: undefined, class: undefined,
});

const mode = computed(() => props.mode ?? 'live');
const events = computed(() => props.events ?? []);
const isEmpty = computed(() => props.text == null || props.text === '');
const placeholder = computed(() => (props.placeholder !== undefined ? props.placeholder : 'Streaming en cours…'));
defineSlots<{
  text?: () => unknown;
  placeholder?: () => unknown;
  'event-label'?: (scope: { event: StreamingMessageEvent }) => unknown;
}>();
</script>

<template>
  <section v-bind="{ ...($attrs), class: (classNames('st-streamingMessage', `st-streamingMessage--${mode}`, props.class)) }" >
    <p :class="classNames('st-streamingMessage__text', isEmpty && !$slots.text && 'st-streamingMessage__text--muted')">
      <slot v-if="$slots.text" name="text" /><template v-else-if="!isEmpty">{{ scalarContent(props.text) }}</template><slot v-else name="placeholder">{{ scalarContent(placeholder) }}</slot>
    </p>
    <ul v-if="events.length > 0" class="st-streamingMessage__trailList">
      <li v-for="event in events" :key="event.id"><slot v-if="$slots['event-label']" name="event-label" :event="event" /><template v-else>{{ scalarContent(event.label) }}</template></li>
    </ul>
  </section>
</template>
