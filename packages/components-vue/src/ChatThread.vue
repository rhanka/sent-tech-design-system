<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed, nextTick, onMounted, onUnmounted, ref, useAttrs, watch } from 'vue';
import { classNames } from './classNames.js';
import ChatMessage from './ChatMessage.vue';
import type { ChatMessageRole, ChatMessageStatus } from './ChatMessage.vue';

export type ChatThreadProps = {
  label?: string;
  autoScroll?: boolean;
  messages?: Array<{
    id: string;
    role?: ChatMessageRole;
    content: unknown;
    status?: ChatMessageStatus;
  }>;
  emptyLabel?: unknown;
  class?: string;
};

defineOptions({ name: 'ChatThread', inheritAttrs: false });
const props = withDefaults(defineProps<ChatThreadProps>(), {
  label: undefined,
  autoScroll: true,
  messages: undefined,
  emptyLabel: undefined,
  class: undefined,
});
defineSlots<{
  'message-content'?: (scope: { message: NonNullable<ChatThreadProps['messages']>[number] }) => unknown;
  default?: () => unknown;
  empty?: () => unknown;
}>();
const attrs = useAttrs();

const sectionEl = ref<HTMLElement | null>(null);
let observer: MutationObserver | undefined;

function scrollToBottom() {
  const node = sectionEl.value;
  if (!node) return;
  node.scrollTop = node.scrollHeight;
}

onMounted(() => {
  if (!props.autoScroll) return;
  const node = sectionEl.value;
  if (!node) return;
  scrollToBottom();
  observer = new MutationObserver(() => scrollToBottom());
  observer.observe(node, { childList: true, subtree: true, characterData: true });
});

onUnmounted(() => {
  observer?.disconnect();
});

watch(
  () => props.messages,
  () => {
    if (props.autoScroll) nextTick(scrollToBottom);
  },
  { deep: true },
);

const ariaLabel = computed(() => props.label ?? (attrs['aria-label'] as string | undefined) ?? 'Chat thread');
</script>

<template>
  <section
    v-bind="{ ...($attrs), class: (classNames('st-chatThread', props.class)) }"
    ref="sectionEl"

    role="log"
    :aria-label="ariaLabel"
    aria-live="polite"
    aria-relevant="additions text"
  >
    <div class="st-chatThread__list">
      <template v-if="props.messages?.length">
        <ChatMessage
          v-for="message in props.messages"
          :key="message.id"
          :role="message.role"
          :status="message.status"
          :content="message.content"
        ><template v-if="$slots['message-content']" #default><slot name="message-content" :message="message" /></template></ChatMessage>
      </template>
      <template v-else-if="$slots.default"><slot /></template>
    </div>
    <div
      v-if="!props.messages?.length && !$slots.default && ($slots.empty || props.emptyLabel != null)"
      class="st-chatThread__empty"
    >
      <template v-if="$slots.empty"><slot name="empty" /></template>
      <template v-else>{{ scalarContent(props.emptyLabel) }}</template>
    </div>
  </section>
</template>
