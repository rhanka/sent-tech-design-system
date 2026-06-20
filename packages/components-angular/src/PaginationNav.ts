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
    <nav
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Pagination'"
    >
      @if (previousHref) {
        <a
          class="st-paginationNav__prev"
          [href]="(currentPage ?? 1) <= 1 ? null : previousHref"
          [attr.aria-disabled]="(currentPage ?? 1) <= 1 ? 'true' : null"
          rel="prev"
        >{{ previousLabel ?? 'Précédent' }}</a>
      }
      @for (p of pages; track p) {
        <span
          class="st-paginationNav__page"
          [class.st-paginationNav__page--current]="p === (currentPage ?? 1)"
          [attr.aria-current]="p === (currentPage ?? 1) ? 'page' : null"
        >{{ p }}</span>
      }
      @if (nextHref) {
        <a
          class="st-paginationNav__next"
          [href]="(currentPage ?? 1) >= totalPageCount ? null : nextHref"
          [attr.aria-disabled]="(currentPage ?? 1) >= totalPageCount ? 'true' : null"
          rel="next"
        >{{ nextLabel ?? 'Suivant' }}</a>
      }
      <ng-content></ng-content>
    </nav>
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

  get currentPage(): number {
    return this.page ?? 1;
  }

  get totalPageCount(): number {
    return this.pageCount ?? this.totalPages ?? 1;
  }

  get pages(): number[] {
    const total = this.totalPageCount;
    if (total <= 0) return [];
    const sibs = this.siblings ?? 1;
    const current = this.currentPage;
    const start = Math.max(1, current - sibs);
    const end = Math.min(total, current + sibs);
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }

  get hostClass(): string {
    return classNames("st-paginationNav", this.classInput);
  }
}
