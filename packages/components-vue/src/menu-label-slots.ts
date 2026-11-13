import type { MenuActionItem, MenuGroupItem } from './Menu.js';

export type MenuLabelSlots = {
  'item-label'?: (scope: { item: MenuActionItem; index: number; depth: number }) => unknown;
  'group-label'?: (scope: { item: MenuGroupItem; index: number; depth: number }) => unknown;
};
