import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class PaginationNav {
    static stComponentName = "PaginationNav";
    componentName = "PaginationNav";
    page;
    pageCount;
    totalPages;
    siblings;
    label;
    previousLabel;
    nextLabel;
    classInput;
    pageChange = new EventEmitter();
    get currentPage() {
        return this.page ?? 1;
    }
    get totalPageCount() {
        return this.pageCount ?? this.totalPages ?? 1;
    }
    get slots() {
        const total = Math.max(0, Math.floor(this.totalPageCount));
        if (total <= 0)
            return [];
        const current = Math.min(Math.max(1, Math.floor(this.currentPage)), total);
        const sib = Math.max(0, Math.floor(this.siblings ?? 1));
        const minSlots = sib * 2 + 5;
        if (total <= minSlots) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        const leftSibling = Math.max(current - sib, 1);
        const rightSibling = Math.min(current + sib, total);
        const showLeftEllipsis = leftSibling > 2;
        const showRightEllipsis = rightSibling < total - 1;
        const result = [];
        if (!showLeftEllipsis && showRightEllipsis) {
            const leftItemCount = 3 + sib * 2;
            for (let i = 1; i <= leftItemCount; i += 1)
                result.push(i);
            result.push("ellipsis-end");
            result.push(total);
        }
        else if (showLeftEllipsis && !showRightEllipsis) {
            result.push(1);
            result.push("ellipsis-start");
            const rightItemCount = 3 + sib * 2;
            for (let i = total - rightItemCount + 1; i <= total; i += 1)
                result.push(i);
        }
        else if (showLeftEllipsis && showRightEllipsis) {
            result.push(1);
            result.push("ellipsis-start");
            for (let i = leftSibling; i <= rightSibling; i += 1)
                result.push(i);
            result.push("ellipsis-end");
            result.push(total);
        }
        else {
            for (let i = 1; i <= total; i += 1)
                result.push(i);
        }
        return result;
    }
    slotKey(slot, index) {
        return typeof slot === "number" ? `p-${slot}` : `${slot}-${index}`;
    }
    asPage(slot) {
        return slot;
    }
    go(target) {
        const total = Math.max(0, Math.floor(this.totalPageCount));
        if (target < 1 || target > total || target === this.currentPage)
            return;
        this.pageChange.emit(target);
    }
    get hostClass() {
        return classNames("st-paginationNav", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PaginationNav, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: PaginationNav, isStandalone: true, selector: "st-pagination-nav", inputs: { page: "page", pageCount: "pageCount", totalPages: "totalPages", siblings: "siblings", label: "label", previousLabel: "previousLabel", nextLabel: "nextLabel", classInput: ["class", "classInput"] }, outputs: { pageChange: "pageChange" }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PaginationNav, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { page: [{
                type: NgInput
            }], pageCount: [{
                type: NgInput
            }], totalPages: [{
                type: NgInput
            }], siblings: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], previousLabel: [{
                type: NgInput
            }], nextLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], pageChange: [{
                type: Output
            }] } });
//# sourceMappingURL=PaginationNav.js.map