import { defineComponent, h, ref } from "vue";
import type { Component } from "vue";
import { classNames } from "./classNames.js";

// `value` (Svelte-canonical) is accepted as an alias of `id`; `danger: true`
// (Svelte-canonical) as an alias of `variant: "danger"`; `kind` as an alias of
// `type`. Svelte groups are flat (label-only, no nested `items`).
export type MenuActionItem = {
  id?: string;
  value?: string;
  label: unknown;
  disabled?: boolean;
  variant?: "default" | "danger";
  danger?: boolean;
  /** Optional leading icon component (rendered in `.st-menu__itemIcon`). */
  icon?: Component;
  onClick?: () => void;
};
export type MenuDividerItem = { type?: "divider"; kind?: "divider"; id?: string };
export type MenuGroupItem = {
  type?: "group";
  kind?: "group";
  id?: string;
  label: unknown;
  items?: MenuActionItem[];
};
export type MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem;

function itemKind(item: MenuItem): string | undefined {
  const tagged = item as { type?: string; kind?: string };
  return tagged.type ?? tagged.kind;
}
function isDivider(item: MenuItem): item is MenuDividerItem {
  return itemKind(item) === "divider";
}
function isGroup(item: MenuItem): item is MenuGroupItem {
  return itemKind(item) === "group";
}
function isDangerAction(item: MenuActionItem): boolean {
  return item.variant === "danger" || item.danger === true;
}
function actionKey(item: MenuActionItem): string {
  return item.id ?? item.value ?? String(item.label);
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

    const renderAction = (actionItem: MenuActionItem) =>
      h(
        "button",
        {
          key: actionKey(actionItem),
          type: "button",
          role: "menuitem",
          disabled: actionItem.disabled,
          "aria-disabled": actionItem.disabled ? "true" : undefined,
          class: classNames(
            "st-menu__item",
            isDangerAction(actionItem) && "st-menu__item--danger",
          ),
          onClick: () => emit("select", actionItem),
          onKeydown: (event: KeyboardEvent) => handleItemKeyDown(event, actionItem),
        },
        [
          actionItem.icon
            ? h(
                "span",
                { class: "st-menu__itemIcon", "aria-hidden": "true" },
                h(actionItem.icon, { size: 16, strokeWidth: 2 }),
              )
            : null,
          h("span", { class: "st-menu__itemLabel" }, actionItem.label as string),
        ],
      );

    return () => {
      const children = props.items.map((item, index) => {
        if (isDivider(item)) {
          return h("div", {
            key: item.id ?? index,
            class: "st-menu__divider",
            role: "separator",
            "aria-hidden": "true",
          });
        }
        if (isGroup(item)) {
          // Canon-aligned (Svelte): a group is a flat `div role="presentation"`
          // label; nested `items` (Vue-native shape) render as flat siblings.
          return [
            h(
              "div",
              { key: item.id ?? index, class: "st-menu__group", role: "presentation" },
              item.label as string,
            ),
            ...(item.items ?? []).map((child) => renderAction(child)),
          ];
        }
        return renderAction(item as MenuActionItem);
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
