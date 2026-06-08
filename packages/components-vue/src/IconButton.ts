import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonVariant = "secondary" | "danger" | "ghost";

export type IconButtonProps = {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  class?: string;
};

export const IconButton = defineComponent({
  name: "IconButton",
  props: {
    size: {
      type: String as () => IconButtonSize,
      default: "md",
    },
    variant: {
      type: String as () => IconButtonVariant,
      default: "ghost",
    },
    type: {
      type: String as () => "button" | "submit" | "reset",
      default: "button",
    },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
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
            "st-iconButton",
            `st-iconButton--${props.size}`,
            `st-iconButton--${props.variant}`,
            props.class,
          ),
        },
        slots.default?.(),
      );
  },
});
