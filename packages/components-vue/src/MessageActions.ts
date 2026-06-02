import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type MessageActionVariant = "default" | "danger";
export type MessageAction = {
  id?: string;
  label: unknown;
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
      default: "always",
    },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const visibility = props.visibility ?? "always";
      return h(
        "nav",
        {
          ...attrs,
          class: classNames(
            "st-messageActions",
            visibility === "hover" && "st-messageActions--hoverOnly",
            props.class,
          ),
          "aria-label": "Message actions",
        },
        props.actions.map((action, index) =>
          h(
            "button",
            {
              key: action.id ?? index,
              type: "button",
              class: classNames(
                "st-button st-button--ghost st-button--sm",
                action.variant === "danger" && "st-button--danger",
              ),
              disabled: action.disabled,
              onClick: action.onClick,
            },
            action.label as string,
          ),
        ),
      );
    };
  },
});
