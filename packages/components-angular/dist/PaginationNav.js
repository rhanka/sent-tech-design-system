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
    get hostClass() {
        return ["st-paginationNav", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PaginationNav, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: PaginationNav, isStandalone: true, selector: "st-pagination-nav", inputs: { page: "page", pageCount: "pageCount", totalPages: "totalPages", siblings: "siblings", label: "label", previousLabel: "previousLabel", nextLabel: "nextLabel", previousHref: "previousHref", nextHref: "nextHref", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PaginationNav, decorators: [{
            type: Component,
            args: [{
                    selector: "st-pagination-nav",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
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