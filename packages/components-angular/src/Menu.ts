import { Component, Input as NgInput } from "@angular/core";

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
  icon?: unknown;
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

export type MenuProps = {
  items: MenuItem[];
  dense?: boolean;
  role?: string;
  class?: string;
};

@Component({
  selector: "st-menu",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Menu {
  static readonly stComponentName = "Menu";
  readonly componentName = "Menu";
  @NgInput() items!: MenuItem[];
  @NgInput() dense?: boolean;
  @NgInput() role?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-menu", this.classInput].filter(Boolean).join(" ");
  }
}
