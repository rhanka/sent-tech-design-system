import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SideNavItem = {
  label: unknown;
  href: string;
  active?: boolean;
  children?: SideNavItem[];
};

export type SideNavProps = {
  items: SideNavItem[];
  label?: string;
  class?: string;
};

@Component({
  selector: "st-side-nav",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class SideNav {
  static readonly stComponentName = "SideNav";
  readonly componentName = "SideNav";
  @NgInput() items!: SideNavItem[];
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-sideNav", this.classInput].filter(Boolean).join(" ");
  }
}
