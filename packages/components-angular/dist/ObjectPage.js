import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class ObjectPage {
    static stComponentName = "ObjectPage";
    componentName = "ObjectPage";
    entityTitle = "";
    primaryAction;
    secondaryAction;
    kpis = [];
    fields = [];
    relatedColumns = [];
    relatedRows = [];
    classInput;
    get hostClass() {
        return ["st-op", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ObjectPage, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ObjectPage, isStandalone: true, selector: "st-object-page", inputs: { entityTitle: "entityTitle", primaryAction: "primaryAction", secondaryAction: "secondaryAction", kpis: "kpis", fields: "fields", relatedColumns: "relatedColumns", relatedRows: "relatedRows", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ObjectPage, decorators: [{
            type: Component,
            args: [{
                    selector: "st-object-page",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { entityTitle: [{
                type: NgInput
            }], primaryAction: [{
                type: NgInput
            }], secondaryAction: [{
                type: NgInput
            }], kpis: [{
                type: NgInput
            }], fields: [{
                type: NgInput
            }], relatedColumns: [{
                type: NgInput
            }], relatedRows: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ObjectPage.js.map