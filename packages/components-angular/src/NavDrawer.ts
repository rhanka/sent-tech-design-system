import { Component, Input as NgInput } from "@angular/core";
import type { NavShellSide } from "./NavShell.js";

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
  template: `
    <aside [attr.data-st-component]="componentName" [attr.aria-label]="label || title" [class]="hostClass">
      <ng-content></ng-content>
    </aside>
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
    return ["st-navShell", "st-navShell--drawer", `st-navShell--${this.side}`, this.open ? "st-navShell--open" : undefined, this.classInput].filter(Boolean).join(" ");
  }
}
