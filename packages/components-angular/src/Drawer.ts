import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type DrawerPlacement = "left" | "right" | "bottom";

export type DrawerProps = {
  open?: boolean;
  title?: string;
  description?: string;
  placement?: DrawerPlacement;
  class?: string;
};

@Component({
  selector: "st-drawer",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Drawer {
  static readonly stComponentName = "Drawer";
  readonly componentName = "Drawer";
  @NgInput() open?: boolean;
  @NgInput() title?: string;
  @NgInput() description?: string;
  @NgInput() placement?: DrawerPlacement;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-drawer", this.classInput].filter(Boolean).join(" ");
  }
}
