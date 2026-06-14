import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

// `pageCount` (Svelte-canonical) is accepted as an alias of `totalPages`.
export type PaginationNavProps = {
  page?: number;
  pageCount?: number;
  totalPages?: number;
  siblings?: number;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  previousHref?: string;
  nextHref?: string;
  class?: string;
};

@Component({
  selector: "st-pagination-nav",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class PaginationNav {
  static readonly stComponentName = "PaginationNav";
  readonly componentName = "PaginationNav";
  @NgInput() page?: number;
  @NgInput() pageCount?: number;
  @NgInput() totalPages?: number;
  @NgInput() siblings?: number;
  @NgInput() label?: string;
  @NgInput() previousLabel?: string;
  @NgInput() nextLabel?: string;
  @NgInput() previousHref?: string;
  @NgInput() nextHref?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-paginationNav", this.classInput].filter(Boolean).join(" ");
  }
}
