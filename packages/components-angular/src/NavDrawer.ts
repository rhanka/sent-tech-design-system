import { Component, Input as NgInput } from "@angular/core";
import type { NavShellSide } from "./NavShell.js";
import { Drawer } from "./Drawer.js";

export type NavDrawerProps = {
  title?: string;
  label?: string;
  open?: boolean;
  side?: NavShellSide;
  class?: string;
};

@Component({
  selector: "st-nav-drawer",
  standalone: true,
  imports: [Drawer],
  template: `
    <st-drawer [open]="open" [title]="title || label || 'Navigation'" [placement]="side" [class]="hostClass">
      <ng-content></ng-content>
    </st-drawer>
  `,
})
export class NavDrawer {
  static readonly stComponentName = "NavDrawer";
  readonly componentName = "NavDrawer";
  @NgInput() title?: string;
  @NgInput() label?: string;
  @NgInput() open = false;
  @NgInput() side: NavShellSide = "left";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-navDrawer", "st-navShell", "st-navShell--drawer", this.classInput].filter(Boolean).join(" ");
  }
}
