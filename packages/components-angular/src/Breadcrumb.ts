import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export interface BreadcrumbItem {
  label: unknown;
  href?: string;
  current?: boolean;
}

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  label?: string;
  class?: string;
};

@Component({
  selector: "st-breadcrumb",
  standalone: true,
  template: `
    <nav
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Breadcrumb'"
    >
      <ol>
        @for (item of items; track $index) {
          <li>
            @if (item.href && !item.current) {
              <a [href]="item.href">{{ item.label }}</a>
            } @else {
              <span [attr.aria-current]="item.current ? 'page' : null">{{ item.label }}</span>
            }
            @if ($index < items.length - 1) {
              <span class="st-breadcrumb__separator">/</span>
            }
          </li>
        }
      </ol>
      <ng-content></ng-content>
    </nav>
  `,
})
export class Breadcrumb {
  static readonly stComponentName = "Breadcrumb";
  readonly componentName = "Breadcrumb";

  @NgInput() items!: BreadcrumbItem[];
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-breadcrumb", this.classInput);
  }
}
