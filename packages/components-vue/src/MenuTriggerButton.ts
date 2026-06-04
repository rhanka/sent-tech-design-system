import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

// `expanded` (Svelte-canonical) is accepted as an alias of `open`.
export type MenuTriggerButtonProps = {
  open?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  class?: string;
};

export const MenuTriggerButton = defineComponent({
  name: "MenuTriggerButton",
  props: {
    open: { type: Boolean, default: undefined },
    expanded: { type: Boolean, default: undefined },
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
            "st-menuTriggerButton st-button st-button--secondary st-button--sm",
            props.class,
          ),
          "aria-expanded": isOpen,
          disabled: props.disabled,
        },
        slots.default?.(),
      );
    };
  },
});
