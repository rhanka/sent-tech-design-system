import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type StructuredListItem = {
  term?: unknown;
  label?: unknown;
  description?: unknown;
  value?: unknown;
};

export type StructuredListProps = {
  items: StructuredListItem[];
  bordered?: boolean;
  class?: string;
};

@Component({
  selector: "st-structured-list",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class StructuredList {
  static readonly stComponentName = "StructuredList";
  readonly componentName = "StructuredList";
  @NgInput() items!: StructuredListItem[];
  @NgInput() bordered?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-structuredList",
      this.bordered && "st-structuredList--bordered",
      this.classInput,
    );
  }
}
