import { Component, Input as NgInput } from "@angular/core";
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
    classInput;
    get hostClass() {
        return ["st-pagination", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Pagination, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Pagination, isStandalone: true, selector: "st-pagination", inputs: { page: "page", pageSize: "pageSize", totalItems: "totalItems", totalPages: "totalPages", pageCount: "pageCount", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Pagination, decorators: [{
            type: Component,
            args: [{
                    selector: "st-pagination",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
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
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Pagination.js.map