import { defineComponent, h } from "vue";
import { ChevronDownCircle } from "lucide-vue-next";
import { classNames } from "./classNames.js";

// `expanded` (Svelte-canonical) is accepted as an alias of `open`.
export type MenuTriggerButtonSize = "sm" | "md" | "lg";
export type MenuTriggerButtonVariant = "ghost" | "secondary";
export type MenuTriggerButtonProps = {
  open?: boolean;
  expanded?: boolean;
  size?: MenuTriggerButtonSize;
  variant?: MenuTriggerButtonVariant;
  disabled?: boolean;
  class?: string;
};

export const MenuTriggerButton = defineComponent({
  name: "MenuTriggerButton",
  props: {
    open: { type: Boolean, default: undefined },
    expanded: { type: Boolean, default: undefined },
    size: { type: String as () => MenuTriggerButtonSize, default: "md" },
    variant: { type: String as () => MenuTriggerButtonVariant, default: "ghost" },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const isOpen = props.open ?? props.expanded ?? false;
      return h(
        "button",
        {
          ...attrs,
          type: "button",
          class: classNames(
            `st-iconButton st-iconButton--${props.size} st-iconButton--${props.variant}`,
            props.class,
          ),
          "aria-haspopup": "menu",
          "aria-expanded": isOpen,
          disabled: props.disabled,
        },
        slots.default?.() ?? h(ChevronDownCircle, { size: 18, strokeWidth: 2, "aria-hidden": "true" }),
      );
    };
  },
});
