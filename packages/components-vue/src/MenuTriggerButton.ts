import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type MenuTriggerButtonProps = {
  open?: boolean;
  disabled?: boolean;
  class?: string;
};

export const MenuTriggerButton = defineComponent({
  name: "MenuTriggerButton",
  props: {
    open: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      return h(
        "button",
        {
          ...attrs,
          type: "button",
          class: classNames(
            "st-menuTriggerButton st-button st-button--secondary st-button--sm",
            props.class,
          ),
          "aria-expanded": props.open,
          disabled: props.disabled,
        },
        slots.default?.(),
      );
    };
  },
});
