import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

type Slot = number | "ellipsis-start" | "ellipsis-end";

// `pageCount` (Svelte-canonical) is accepted as an alias of `totalPages`.
export type PaginationNavProps = {
  page?: number;
  pageCount?: number;
  totalPages?: number;
  siblings?: number;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
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
      <ul class="st-paginationNav__list">
        <li>
          <button
            type="button"
            class="st-paginationNav__nav"
            [attr.aria-label]="previousLabel ?? 'Page précédente'"
            [disabled]="currentPage <= 1 || totalPageCount <= 0"
            (click)="go(currentPage - 1)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </li>
        @for (slot of slots; track slotKey(slot, $index)) {
          <li>
            @if (slot === 'ellipsis-start' || slot === 'ellipsis-end') {
              <span class="st-paginationNav__ellipsis" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </span>
            } @else {
              <button
                type="button"
                class="st-paginationNav__page"
                [class.st-paginationNav__page--active]="slot === currentPage"
                [attr.aria-label]="'Page ' + slot"
                [attr.aria-current]="slot === currentPage ? 'page' : null"
                (click)="go(asPage(slot))"
              >{{ slot }}</button>
            }
          </li>
        }
        <li>
          <button
            type="button"
            class="st-paginationNav__nav"
            [attr.aria-label]="nextLabel ?? 'Page suivante'"
            [disabled]="currentPage >= totalPageCount || totalPageCount <= 0"
            (click)="go(currentPage + 1)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </li>
      </ul>
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
  @NgInput("class") classInput?: string;

  @Output() readonly pageChange = new EventEmitter<number>();

  get currentPage(): number {
    return this.page ?? 1;
  }

  get totalPageCount(): number {
    return this.pageCount ?? this.totalPages ?? 1;
  }

  get slots(): Slot[] {
    const total = Math.max(0, Math.floor(this.totalPageCount));
    if (total <= 0) return [];

    const current = Math.min(Math.max(1, Math.floor(this.currentPage)), total);
    const sib = Math.max(0, Math.floor(this.siblings ?? 1));

    const minSlots = sib * 2 + 5;
    if (total <= minSlots) {
      return Array.from({ length: total }, (_, i) => i + 1) as Slot[];
    }

    const leftSibling = Math.max(current - sib, 1);
    const rightSibling = Math.min(current + sib, total);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < total - 1;

    const result: Slot[] = [];

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftItemCount = 3 + sib * 2;
      for (let i = 1; i <= leftItemCount; i += 1) result.push(i);
      result.push("ellipsis-end");
      result.push(total);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      result.push(1);
      result.push("ellipsis-start");
      const rightItemCount = 3 + sib * 2;
      for (let i = total - rightItemCount + 1; i <= total; i += 1) result.push(i);
    } else if (showLeftEllipsis && showRightEllipsis) {
      result.push(1);
      result.push("ellipsis-start");
      for (let i = leftSibling; i <= rightSibling; i += 1) result.push(i);
      result.push("ellipsis-end");
      result.push(total);
    } else {
      for (let i = 1; i <= total; i += 1) result.push(i);
    }

    return result;
  }

  slotKey(slot: Slot, index: number): string {
    return typeof slot === "number" ? `p-${slot}` : `${slot}-${index}`;
  }

  asPage(slot: Slot): number {
    return slot as number;
  }

  go(target: number): void {
    const total = Math.max(0, Math.floor(this.totalPageCount));
    if (target < 1 || target > total || target === this.currentPage) return;
    this.pageChange.emit(target);
  }

  get hostClass(): string {
    return classNames("st-paginationNav", this.classInput);
  }
}
