import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type MessageActionVariant = "default" | "danger";
/**
 * `label` (React/Vue) is rendered when present; otherwise `icon` (the
 * Svelte-canonical content) is rendered. `label` is always used for the
 * accessible name when provided. At least one of `label`/`icon` should be set.
 */
export type MessageAction = {
  id?: string;
  label?: unknown;
  icon?: unknown;
  disabled?: boolean;
  variant?: MessageActionVariant;
  onClick?: () => void;
};

export type MessageActionsProps = {
  actions: MessageAction[];
  visibility?: "always" | "hover";
  class?: string;
};

export const MessageActions = defineComponent({
  name: "MessageActions",
  props: {
    actions: { type: Array as () => MessageAction[], required: true },
    visibility: {
      type: String as () => "always" | "hover",
      default: "hover",
    },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const visibility = props.visibility ?? "hover";
      return h(
        "div",
        {
          ...attrs,
          class: classNames(
            "st-messageActions",
            visibility === "hover" && "st-messageActions--hoverOnly",
            props.class,
          ),
          role: "group",
          "aria-label": "Actions du message",
        },
        props.actions.map((action, index) =>
          h(
            "button",
            {
              key: action.id ?? index,
              type: "button",
              class: classNames(
                "st-iconButton st-iconButton--sm",
                action.variant === "danger"
                  ? "st-iconButton--danger"
                  : "st-iconButton--ghost",
              ),
              disabled: action.disabled,
              "aria-label":
                (action.label != null ? String(action.label) : undefined) ??
                action.id,
              onClick: action.onClick,
            },
            (action.icon ?? action.label) as string,
          ),
        ),
      );
    };
  },
});
