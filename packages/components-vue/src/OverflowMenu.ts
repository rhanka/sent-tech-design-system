import type { MenuItem } from "./Menu.js";
import type { SubMenuSide } from "./menu-cascade.js";

export type OverflowMenuPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type OverflowMenuSubmenuSide = SubMenuSide;

export type OverflowMenuProps = {
  items: MenuItem[];
  label?: string;
  open?: boolean;
  dense?: boolean;
  placement?: OverflowMenuPlacement;
  class?: string;
  submenuSide?: SubMenuSide;
};

export type { MenuItem as OverflowMenuItem };

import OverflowMenuComponent from "./OverflowMenu.vue";

export const OverflowMenu: typeof OverflowMenuComponent = OverflowMenuComponent;
