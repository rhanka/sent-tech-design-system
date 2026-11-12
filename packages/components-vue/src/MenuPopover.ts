import type { MenuItem } from "./Menu.js";
import type { SubMenuSide } from "./menu-cascade.js";

export type MenuPopoverPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type MenuPopoverAlign = "start" | "end" | "center";

export type MenuPopoverSubmenuSide = SubMenuSide;

export type MenuPopoverProps = {
  items?: MenuItem[];
  open?: boolean;
  /** Anchor element used for position computation and outside-click exclusion (Svelte-canonical). */
  trigger?: HTMLElement | null;
  placement?: MenuPopoverPlacement;
  align?: MenuPopoverAlign;
  /** Accessible name for the panel (Svelte-canonical: applied as aria-label on role="dialog"). */
  label?: string;
  class?: string;
  closeOnOutside?: boolean;
  closeOnEscape?: boolean;
  submenuSide?: SubMenuSide;
};

export type { MenuItem };

import MenuPopoverComponent from "./MenuPopover.vue";

export const MenuPopover = MenuPopoverComponent;
