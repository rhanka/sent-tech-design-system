import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import type { ChatMessageStatus } from "./ChatMessage.js";

export type MessageStatusBadgeTone = "neutral" | "info" | "success" | "warning" | "error";

export type MessageStatusBadgeProps = {
  status: ChatMessageStatus;
  tone?: MessageStatusBadgeTone;
  labels?: Partial<Record<ChatMessageStatus, unknown>>;
  class?: string;
};

export const MessageStatusBadge = defineComponent({
  name: "MessageStatusBadge",
  props: {
    status: { type: String as () => ChatMessageStatus, required: true },
    tone: { type: String as () => MessageStatusBadgeTone, default: undefined },
    labels: {
      type: Object as () => Partial<Record<ChatMessageStatus, unknown>>,
      default: undefined,
    },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const status = props.status;
      const normalized =
        status === "sent"
          ? "completed"
          : status === "streaming"
            ? "processing"
            : status === "error"
              ? "failed"
              : status;
      const resolvedTone =
        props.tone ??
        (normalized === "completed"
          ? "success"
          : normalized === "failed"
            ? "error"
            : normalized === "processing"
              ? "info"
              : "neutral");
      const label =
        (props.labels?.[status] ?? props.labels?.[normalized as ChatMessageStatus]) ??
        (normalized.charAt(0).toUpperCase() + normalized.slice(1));
      return h(
        "span",
        {
          ...attrs,
          class: classNames(
            "st-messageStatusBadge",
            `st-badge st-badge--${resolvedTone}`,
            props.class,
          ),
        },
        [
          h("span", { class: "st-messageStatusBadge__dot", "aria-hidden": "true" }),
          label as string,
        ],
      );
    };
  },
});
