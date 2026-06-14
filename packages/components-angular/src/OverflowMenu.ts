import { Component, Input as NgInput } from "@angular/core";

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

@Component({
  selector: "st-overflow-menu",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class OverflowMenu {
  static readonly stComponentName = "OverflowMenu";
  readonly componentName = "OverflowMenu";
  @NgInput() items!: MenuItem[];
  @NgInput() label?: string;
  @NgInput() open?: boolean;
  @NgInput() dense?: boolean;
  @NgInput() placement?: OverflowMenuPlacement;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-overflowMenu", this.classInput].filter(Boolean).join(" ");
  }
}
