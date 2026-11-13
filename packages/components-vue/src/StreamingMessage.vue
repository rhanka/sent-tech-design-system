<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';
import type { ChatMessageStatus } from './ChatMessage.vue';

export type StreamingMessageEvent = {
  id: string;
  label: unknown;
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
</script>

<template>
  <section v-bind="$attrs" :class="classNames('st-streamingMessage', `st-streamingMessage--${mode}`, props.class)">
    <p :class="classNames('st-streamingMessage__text', isEmpty && 'st-streamingMessage__text--muted')">
      {{ isEmpty ? placeholder : props.text }}
    </p>
    <ul v-if="events.length > 0" class="st-streamingMessage__trailList">
      <li v-for="event in events" :key="event.id">{{ event.label }}</li>
    </ul>
  </section>
</template>
