import { Component, Input as NgInput } from "@angular/core";
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
    previousHref;
    nextHref;
    classInput;
    get currentPage() {
        return this.page ?? 1;
    }
    get totalPageCount() {
        return this.pageCount ?? this.totalPages ?? 1;
    }
    get pages() {
        const total = this.totalPageCount;
        if (total <= 0)
            return [];
        const sibs = this.siblings ?? 1;
        const current = this.currentPage;
        const start = Math.max(1, current - sibs);
        const end = Math.min(total, current + sibs);
        const result = [];
        for (let i = start; i <= end; i++)
            result.push(i);
        return result;
    }
    get hostClass() {
        return classNames("st-paginationNav", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PaginationNav, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: PaginationNav, isStandalone: true, selector: "st-pagination-nav", inputs: { page: "page", pageCount: "pageCount", totalPages: "totalPages", siblings: "siblings", label: "label", previousLabel: "previousLabel", nextLabel: "nextLabel", previousHref: "previousHref", nextHref: "nextHref", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
            }], previousHref: [{
                type: NgInput
            }], nextHref: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=PaginationNav.js.map