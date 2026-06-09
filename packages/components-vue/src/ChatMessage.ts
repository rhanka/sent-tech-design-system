import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ChatMessageRole = "user" | "assistant" | "system" | "tool";
export type ChatMessageStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "idle"
  | "streaming"
  | "error"
  | "sent";

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

export const ChatMessage = defineComponent({
  name: "ChatMessage",
  props: {
    role: { type: String as () => ChatMessageRole, default: "assistant" },
    status: { type: String as () => ChatMessageStatus, default: "completed" },
    content: { type: [String, Object] as unknown as () => unknown, default: undefined },
    timestamp: { type: [String, Object] as unknown as () => unknown, default: undefined },
    footer: { type: [String, Object] as unknown as () => unknown, default: undefined },
    actions: { type: [String, Object] as unknown as () => unknown, default: undefined },
    avatar: { type: [String, Object] as unknown as () => unknown, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const role = props.role ?? "assistant";
      const status = props.status;
      const normalizedStatus =
        status === "idle" || status === "streaming"
          ? "processing"
          : status === "error"
            ? "failed"
            : status;
      const isStreaming = normalizedStatus === "processing";
      const alignment = role === "user" ? "end" : "start";
      const avatarNode = slots.avatar?.() ?? props.avatar;
      const footerNode = slots.footer?.() ?? props.footer;
      const actionsNode = slots.actions?.() ?? props.actions;
      return h(
        "article",
        {
          ...attrs,
          class: classNames(
            "st-chatMessage",
            `st-chatMessage--${role}`,
            normalizedStatus && `st-chatMessage--${normalizedStatus}`,
            props.class,
          ),
          "data-role": role,
          "data-status": normalizedStatus,
          "data-align": alignment,
          "aria-live": isStreaming ? "polite" : undefined,
        },
        [
          avatarNode
            ? h("div", { class: "st-chatMessage__avatar", "aria-hidden": "true" }, avatarNode as never)
            : null,
          h("div", { class: "st-chatMessage__body" }, [
            h("div", { class: "st-chatMessage__bubble" }, [
              h(
                "div",
                { class: "st-chatMessage__content" },
                slots.default?.() ?? (props.content as string | undefined),
              ),
              isStreaming
                ? h("span", { class: "st-chatMessage__pulse", "aria-hidden": "true" })
                : null,
            ]),
            footerNode || props.timestamp
              ? h("div", { class: "st-chatMessage__footer" }, [
                  footerNode
                    ? (footerNode as never)
                    : h("span", { class: "st-chatMessage__timestamp" }, props.timestamp as never),
                ])
              : null,
            actionsNode
              ? h("div", { class: "st-chatMessage__actions" }, actionsNode as never)
              : null,
          ]),
        ],
      );
    };
  },
});
