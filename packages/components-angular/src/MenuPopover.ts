import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { Menu } from "./Menu.js";

import type { MenuItem } from "./Menu.js";

export type MenuPopoverPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type MenuPopoverProps = {
  items?: MenuItem[];
  open?: boolean;
  placement?: MenuPopoverPlacement;
  class?: string;
};

@Component({
  selector: "st-menu-popover",
  standalone: true,
  styles: [":host { display: contents; }"],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class MenuPopover {
  static readonly stComponentName = "MenuPopover";
  readonly componentName = "MenuPopover";
  @NgInput() items?: MenuItem[];
  @NgInput() open?: boolean;
  @NgInput() placement?: MenuPopoverPlacement;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-menuPopover", this.classInput].filter(Boolean).join(" ");
  }
}
