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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Breadcrumb {
  static readonly stComponentName = "Breadcrumb";
  readonly componentName = "Breadcrumb";
  @NgInput() items!: BreadcrumbItem[];
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-breadcrumb", this.classInput].filter(Boolean).join(" ");
  }
}
