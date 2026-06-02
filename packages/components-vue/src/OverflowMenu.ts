import { defineComponent, h, ref, watch, onUnmounted } from "vue";
import { classNames } from "./classNames.js";
import { Menu } from "./Menu.js";
import type { MenuItem } from "./Menu.js";

export type OverflowMenuPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type OverflowMenuProps = {
  items: MenuItem[];
  label?: string;
  open?: boolean;
  dense?: boolean;
  placement?: OverflowMenuPlacement;
  class?: string;
};

export type { MenuItem as OverflowMenuItem };

export const OverflowMenu = defineComponent({
  name: "OverflowMenu",
  props: {
    items: { type: Array as () => MenuItem[], required: true },
    label: { type: String, default: "More" },
    open: { type: Boolean, default: undefined },
    dense: { type: Boolean, default: false },
    placement: { type: String as () => OverflowMenuPlacement, default: "bottom-start" },
    class: { type: String, default: undefined },
  },
  emits: ["update:open"],
  setup(props, { emit, attrs }) {
    const localOpen = ref(false);

    const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);

    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
    };

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      const host = (attrs as { _hostEl?: HTMLElement })._hostEl;
      if (target && host && !host.contains(target)) setOpen(false);
    };

    watch(
      () => isOpen(),
      (open) => {
        if (open) document.addEventListener("mousedown", onMouseDown);
        else document.removeEventListener("mousedown", onMouseDown);
      },
    );

    onUnmounted(() => document.removeEventListener("mousedown", onMouseDown));

    return () => {
      const open = isOpen();

      return h(
        "div",
        {
          ...attrs,
          class: classNames(
            "st-overflowMenu",
            props.dense && "st-overflowMenu--dense",
            props.class,
          ),
        },
        [
          h(
            "button",
            {
              type: "button",
              class: "st-overflowMenu__trigger",
              "aria-expanded": open,
              onClick: () => setOpen(!open),
            },
            props.label,
          ),
          open
            ? h(
                "div",
                {
                  class: classNames(
                    "st-overflowMenu__list",
                    `st-overflowMenu__list--${props.placement}`,
                  ),
                },
                h(Menu, { items: props.items }),
              )
            : null,
        ],
      );
    };
  },
});
