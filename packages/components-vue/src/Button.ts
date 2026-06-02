import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  class?: string;
};

export const Button = defineComponent({
  name: "Button",
  props: {
    variant: {
      type: String as () => ButtonVariant,
      default: "primary",
    },
    size: {
      type: String as () => ButtonSize,
      default: "md",
    },
    type: {
      type: String as () => "button" | "submit" | "reset",
      default: "button",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    class: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "button",
        {
          ...attrs,
          type: props.type,
          disabled: props.disabled,
          class: classNames(
            "st-button",
            `st-button--${props.variant}`,
            `st-button--${props.size}`,
            props.class,
          ),
        },
        slots.default?.(),
      );
  },
});
