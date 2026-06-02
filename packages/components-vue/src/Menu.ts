import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type MenuActionItem = {
  id?: string;
  label: unknown;
  disabled?: boolean;
  variant?: "default" | "danger";
  onClick?: () => void;
};
export type MenuDividerItem = { type: "divider"; id?: string };
export type MenuGroupItem = {
  type: "group";
  id?: string;
  label: unknown;
  items: MenuActionItem[];
};
export type MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem;

function isDivider(item: MenuItem): item is MenuDividerItem {
  return "type" in item && (item as MenuDividerItem).type === "divider";
}
function isGroup(item: MenuItem): item is MenuGroupItem {
  return "type" in item && (item as MenuGroupItem).type === "group";
}

export type MenuProps = {
  items: MenuItem[];
  dense?: boolean;
  role?: string;
  class?: string;
};

function moveIndex(index: number, max: number, delta: number): number {
  if (max <= 0) return -1;
  return (index + delta + max) % max;
}

export const Menu = defineComponent({
  name: "Menu",
  props: {
    items: { type: Array as () => MenuItem[], required: true },
    dense: { type: Boolean, default: false },
    role: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["select"],
  setup(props, { emit, attrs }) {
    const rootRef = ref<HTMLElement | null>(null);

    const handleItemKeyDown = (event: KeyboardEvent, item: MenuActionItem) => {
      const root = rootRef.value;
      const focusable = Array.from(
        root?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [],
      );
      const currentIndex = focusable.indexOf(event.currentTarget as HTMLButtonElement);
      const focusAt = (index: number) => focusable[index]?.focus();

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusAt(moveIndex(currentIndex, focusable.length, 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusAt(moveIndex(currentIndex < 0 ? focusable.length : currentIndex, focusable.length, -1));
      } else if (event.key === "Home") {
        event.preventDefault();
        focusAt(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusAt(focusable.length - 1);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!item.disabled) emit("select", item);
      }
    };

    return () => {
      const children = props.items.map((item, index) => {
        if (isDivider(item)) {
          return h("div", {
            key: item.id ?? index,
            class: "st-menu__divider",
            role: "separator",
          });
        }
        if (isGroup(item)) {
          return h(
            "section",
            { key: item.id ?? index, class: "st-menu__group" },
            [
              h("h3", {}, item.label as string),
              ...item.items.map((child) =>
                h(
                  "button",
                  {
                    key: child.id ?? String(child.label),
                    type: "button",
                    role: "menuitem",
                    class: "st-menu__item",
                    disabled: child.disabled,
                    onClick: () => emit("select", child),
                    onKeydown: (event: KeyboardEvent) => handleItemKeyDown(event, child),
                  },
                  h("span", { class: "st-menu__itemLabel" }, child.label as string),
                ),
              ),
            ],
          );
        }
        const actionItem = item as MenuActionItem;
        return h(
          "button",
          {
            key: actionItem.id ?? String(actionItem.label) ?? index,
            type: "button",
            role: "menuitem",
            disabled: actionItem.disabled,
            class: classNames(
              "st-menu__item",
              actionItem.variant === "danger" && "st-menu__item--danger",
            ),
            onClick: () => emit("select", actionItem),
            onKeydown: (event: KeyboardEvent) => handleItemKeyDown(event, actionItem),
          },
          h("span", { class: "st-menu__itemLabel" }, actionItem.label as string),
        );
      });

      return h(
        "div",
        {
          ...attrs,
          ref: rootRef,
          class: classNames("st-menu", props.dense && "st-menu--dense", props.class),
          role: props.role ?? "menu",
        },
        children,
      );
    };
  },
});
