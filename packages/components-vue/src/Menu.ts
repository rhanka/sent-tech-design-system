import type { Component } from "vue";
import type { SubMenuSide } from "./menu-cascade.js";

// `value` (Svelte-canonical) is accepted as an alias of `id`; `danger: true`
// (Svelte-canonical) as an alias of `variant: "danger"`; `kind` as an alias of
// `type`. Svelte groups are flat (label-only, no nested `items`); Vue accepts
// both shapes. Cascade (spec SPEC_EVOL_MENU_CASCADE §2.1): `children` (non-empty
// = sub-menu trigger) and `selected` (parent line selected state while open).
export type MenuActionItem = {
  id?: string;
  value?: string;
  label: unknown;
  disabled?: boolean;
  variant?: "default" | "danger";
  danger?: boolean;
  /** Optional leading icon component or string character (rendered in `.st-menu__itemIcon`). */
  icon?: Component | string;
  onClick?: () => void;
  children?: MenuItem[];
  selected?: boolean;
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

export type MenuSubmenuSide = SubMenuSide;

export type MenuProps = {
  items: MenuItem[];
  dense?: boolean;
  role?: string;
  class?: string;
  submenuSide?: MenuSubmenuSide;
};

import MenuComponent from "./Menu.vue";

export const Menu = MenuComponent;
