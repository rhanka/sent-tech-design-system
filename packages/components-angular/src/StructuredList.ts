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
    <dl [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track $index) {
        <div class="st-structuredList__row">
          <dt class="st-structuredList__term">{{ item.term ?? item.label }}</dt>
          <dd class="st-structuredList__definition">{{ item.description ?? item.value }}</dd>
        </div>
      }
      <ng-content></ng-content>
    </dl>
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
