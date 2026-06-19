import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { Menu } from "./Menu.js";
import type { MenuItem } from "./Menu.js";

export type MenuPopoverPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type MenuPopoverProps = {
  items?: MenuItem[];
  open?: boolean;
  placement?: MenuPopoverPlacement;
  /** Accessible name for the panel (Svelte-canonical: applied as aria-label on role="dialog"). */
  label?: string;
  class?: string;
};

export type { MenuItem };

export const MenuPopover = defineComponent({
  name: "MenuPopover",
  props: {
    items: { type: Array as () => MenuItem[], default: () => [] },
    open: { type: Boolean, default: true },
    placement: { type: String as () => MenuPopoverPlacement, default: "bottom-start" },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      return h(
        "div",
        {
          ...attrs,
          role: "dialog",
          "aria-label": props.label,
          class: classNames(
            "st-menuPopover",
            `st-menuPopover--${props.placement}`,
            props.class,
          ),
        },
        [
          slots.trigger?.(),
          props.open
            ? h(
                "div",
                { class: "st-menuPopover__content" },
                props.items && props.items.length
                  ? h(Menu, { items: props.items, role: "presentation" })
                  : slots.default?.(),
              )
            : null,
        ],
      );
    };
  },
});
