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
    <nav
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Navigation'"
    >
      <ul>
        @for (item of items; track item.href) {
          <li>
            <a
              [href]="item.href"
              [class]="linkClass(item)"
              [attr.aria-current]="item.active ? 'page' : null"
            >{{ item.label }}</a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class SideNav {
  static readonly stComponentName = "SideNav";
  readonly componentName = "SideNav";

  @NgInput() items!: SideNavItem[];
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  linkClass(item: SideNavItem): string {
    return classNames(item.active && "st-sidenav__link--active");
  }

  get hostClass(): string {
    return classNames("st-sidenav", this.classInput);
  }
}
