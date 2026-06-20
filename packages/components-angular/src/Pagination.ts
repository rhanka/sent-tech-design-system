import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type PaginationProps = {
  page: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  pageCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  class?: string;
};

@Component({
  selector: "st-pagination",
  standalone: true,
  template: `
    <nav
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      aria-label="Pagination"
    >
      <button
        type="button"
        [disabled]="page <= 1"
        (click)="prev()"
      >{{ previousLabel ?? 'Previous' }}</button>
      @for (p of pages; track p) {
        <button
          type="button"
          [class]="pageClass(p)"
          [attr.aria-label]="'Page ' + p"
          [attr.aria-current]="p === page ? 'page' : null"
          (click)="go(p)"
        >{{ p }}</button>
      }
      <button
        type="button"
        [disabled]="page >= totalPageCount"
        (click)="next()"
      >{{ nextLabel ?? 'Next' }}</button>
      <ng-content></ng-content>
    </nav>
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
  @NgInput() previousLabel?: string;
  @NgInput() nextLabel?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly pageChange = new EventEmitter<number>();

  get totalPageCount(): number {
    return (
      this.pageCount ??
      this.totalPages ??
      (this.totalItems
        ? Math.max(1, Math.ceil(this.totalItems / (this.pageSize ?? 10)))
        : this.page)
    );
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPageCount }, (_, i) => i + 1);
  }

  pageClass(p: number): string {
    return classNames(
      "st-pagination__page",
      p === this.page && "st-pagination__page--active",
    );
  }

  prev(): void {
    if (this.page > 1) this.pageChange.emit(this.page - 1);
  }

  next(): void {
    if (this.page < this.totalPageCount) this.pageChange.emit(this.page + 1);
  }

  go(p: number): void {
    this.pageChange.emit(p);
  }

  get hostClass(): string {
    return classNames("st-pagination", this.classInput);
  }
}
