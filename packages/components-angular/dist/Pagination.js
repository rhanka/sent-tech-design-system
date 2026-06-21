import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Pagination {
    static stComponentName = "Pagination";
    componentName = "Pagination";
    page;
    pageSize;
    totalItems;
    totalPages;
    pageCount;
    previousLabel;
    nextLabel;
    classInput;
    pageChange = new EventEmitter();
    get totalPageCount() {
        return (this.pageCount ??
            this.totalPages ??
            (this.totalItems
                ? Math.max(1, Math.ceil(this.totalItems / (this.pageSize ?? 10)))
                : this.page));
    }
    get pages() {
        return Array.from({ length: this.totalPageCount }, (_, i) => i + 1);
    }
    pageClass(p) {
        return classNames("st-pagination__page", p === this.page && "st-pagination__page--active");
    }
    prev() {
        if (this.page > 1)
            this.pageChange.emit(this.page - 1);
    }
    next() {
        if (this.page < this.totalPageCount)
            this.pageChange.emit(this.page + 1);
    }
    go(p) {
        this.pageChange.emit(p);
    }
    get hostClass() {
        return classNames("st-pagination", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Pagination, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Pagination, isStandalone: true, selector: "st-pagination", inputs: { page: "page", pageSize: "pageSize", totalItems: "totalItems", totalPages: "totalPages", pageCount: "pageCount", previousLabel: "previousLabel", nextLabel: "nextLabel", classInput: ["class", "classInput"] }, outputs: { pageChange: "pageChange" }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Pagination, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { page: [{
                type: NgInput
            }], pageSize: [{
                type: NgInput
            }], totalItems: [{
                type: NgInput
            }], totalPages: [{
                type: NgInput
            }], pageCount: [{
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
//# sourceMappingURL=Pagination.js.map