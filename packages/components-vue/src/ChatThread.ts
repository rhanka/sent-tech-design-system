import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { classNames } from "./classNames.js";
import { ChatMessage } from "./ChatMessage.js";
import type { ChatMessageRole, ChatMessageStatus } from "./ChatMessage.js";

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

export const ChatThread = defineComponent({
  name: "ChatThread",
  props: {
    label: { type: String, default: undefined },
    autoScroll: { type: Boolean, default: true },
    messages: {
      type: Array as () => Array<{
        id: string;
        role?: ChatMessageRole;
        content: unknown;
        status?: ChatMessageStatus;
      }>,
      default: undefined,
    },
    emptyLabel: { type: [String, Object] as unknown as () => unknown, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const sectionEl = ref<HTMLElement | null>(null);
    let observer: MutationObserver | undefined;

    const scrollToBottom = () => {
      const node = sectionEl.value;
      if (!node) return;
      node.scrollTop = node.scrollHeight;
    };

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

    return () => {
      const ariaLabel = props.label ?? (attrs["aria-label"] as string | undefined) ?? "Chat thread";
      let listContent;
      let emptyNode = null;
      if (props.messages?.length) {
        listContent = props.messages.map((message) =>
          h(ChatMessage, {
            key: message.id,
            ...(message.role ? { role: message.role } : {}),
            ...(message.status ? { status: message.status } : {}),
            content: message.content as string,
          } as Record<string, unknown>),
        );
      } else if (slots.default) {
        listContent = slots.default();
      } else {
        const emptyContent = slots.empty
          ? slots.empty()
          : props.emptyLabel != null
            ? props.emptyLabel
            : undefined;
        if (emptyContent != null) {
          emptyNode = h("div", { class: "st-chatThread__empty" }, emptyContent as never);
        }
      }
      return h(
        "section",
        {
          ...attrs,
          ref: sectionEl,
          class: classNames("st-chatThread", props.class),
          role: "log",
          "aria-label": ariaLabel,
          "aria-live": "polite",
          "aria-relevant": "additions text",
        },
        [h("div", { class: "st-chatThread__list" }, listContent), emptyNode],
      );
    };
  },
});
