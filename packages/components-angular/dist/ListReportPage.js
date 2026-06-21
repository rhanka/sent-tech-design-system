import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class ListReportPage {
    static stComponentName = "ListReportPage";
    componentName = "ListReportPage";
    appTitle;
    pageTitle = "";
    columns = [];
    rows = [];
    navItems = [];
    primaryAction;
    secondaryAction;
    searchPlaceholder;
    rowActions = [];
    classInput;
    get hostClass() {
        return ["st-lrp", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ListReportPage, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ListReportPage, isStandalone: true, selector: "st-list-report-page", inputs: { appTitle: "appTitle", pageTitle: "pageTitle", columns: "columns", rows: "rows", navItems: "navItems", primaryAction: "primaryAction", secondaryAction: "secondaryAction", searchPlaceholder: "searchPlaceholder", rowActions: "rowActions", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ListReportPage, decorators: [{
            type: Component,
            args: [{
                    selector: "st-list-report-page",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { appTitle: [{
                type: NgInput
            }], pageTitle: [{
                type: NgInput
            }], columns: [{
                type: NgInput
            }], rows: [{
                type: NgInput
            }], navItems: [{
                type: NgInput
            }], primaryAction: [{
                type: NgInput
            }], secondaryAction: [{
                type: NgInput
            }], searchPlaceholder: [{
                type: NgInput
            }], rowActions: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ListReportPage.js.map