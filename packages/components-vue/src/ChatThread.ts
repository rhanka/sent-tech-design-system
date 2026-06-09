import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { ChatMessage } from "./ChatMessage.js";
import type { ChatMessageRole, ChatMessageStatus } from "./ChatMessage.js";

export type ChatThreadProps = {
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
    messages: {
      type: Array as () => Array<{
        id: string;
        role?: ChatMessageRole;
        content: unknown;
        status?: ChatMessageStatus;
      }>,
      default: undefined,
    },
    emptyLabel: { type: [String, Object] as unknown as () => unknown, default: "No messages" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const emptyLabel = props.emptyLabel ?? "No messages";
      const ariaLabel = (attrs["aria-label"] as string | undefined) ?? "Chat thread";
      let listContent;
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
        listContent = [h("p", { class: "st-chatThread__empty" }, emptyLabel as string)];
      }
      return h(
        "section",
        {
          ...attrs,
          class: classNames("st-chatThread", props.class),
          role: "log",
          "aria-label": ariaLabel,
          "aria-live": "polite",
          "aria-relevant": "additions text",
        },
        [h("div", { class: "st-chatThread__list" }, listContent)],
      );
    };
  },
});
