import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type PaginationProps = {
  page: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  pageCount?: number;
  class?: string;
};

@Component({
  selector: "st-pagination",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Pagination {
  static readonly stComponentName = "Pagination";
  readonly componentName = "Pagination";
  @NgInput() page!: number;
  @NgInput() pageSize?: number;
  @NgInput() totalItems?: number;
  @NgInput() totalPages?: number;
  @NgInput() pageCount?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-pagination", this.classInput].filter(Boolean).join(" ");
  }
}
