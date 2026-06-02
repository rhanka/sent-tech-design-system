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
  actions?: unknown;
  class?: string;
};

export const ChatMessage = defineComponent({
  name: "ChatMessage",
  props: {
    role: { type: String as () => ChatMessageRole, default: "assistant" },
    status: { type: String as () => ChatMessageStatus, default: undefined },
    content: { type: [String, Object] as unknown as () => unknown, default: undefined },
    timestamp: { type: [String, Object] as unknown as () => unknown, default: undefined },
    actions: { type: [String, Object] as unknown as () => unknown, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const role = props.role ?? "assistant";
      const status = props.status;
      const normalizedStatus =
        status === "streaming"
          ? "processing"
          : status === "error"
            ? "failed"
            : status;
      const avatar = role[0]?.toUpperCase() ?? "";
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
        },
        [
          h("div", { class: "st-chatMessage__avatar", "aria-hidden": "true" }, avatar),
          h("div", { class: "st-chatMessage__body" }, [
            h("div", { class: "st-chatMessage__bubble" }, [
              h(
                "div",
                { class: "st-chatMessage__content" },
                slots.default?.() ?? (props.content as string | undefined),
              ),
            ]),
            props.timestamp || props.actions
              ? h("footer", { class: "st-chatMessage__footer" }, [
                  props.timestamp
                    ? h("span", { class: "st-chatMessage__timestamp" }, props.timestamp as string)
                    : null,
                  props.actions
                    ? h("span", { class: "st-chatMessage__actions" }, props.actions as string)
                    : null,
                ])
              : null,
          ]),
        ],
      );
    };
  },
});
