import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export interface TableOfContentsItem {
  id: string;
  label: string;
  level?: number;
}

export type TableOfContentsProps = {
  title?: string;
  items: TableOfContentsItem[];
  activeId?: string;
  class?: string;
};

@Component({
  selector: "st-table-of-contents",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class TableOfContents {
  static readonly stComponentName = "TableOfContents";
  readonly componentName = "TableOfContents";
  @NgInput() title?: string;
  @NgInput() items!: TableOfContentsItem[];
  @NgInput() activeId?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-tableOfContents", this.classInput].filter(Boolean).join(" ");
  }
}
