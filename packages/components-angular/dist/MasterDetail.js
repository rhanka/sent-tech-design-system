import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class MasterDetail {
    static stComponentName = "MasterDetail";
    componentName = "MasterDetail";
    listTitle = "";
    detailTitle = "";
    listItems = [];
    detailFields = [];
    detailActions = [];
    classInput;
    get hostClass() {
        return ["st-md", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MasterDetail, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: MasterDetail, isStandalone: true, selector: "st-master-detail", inputs: { listTitle: "listTitle", detailTitle: "detailTitle", listItems: "listItems", detailFields: "detailFields", detailActions: "detailActions", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MasterDetail, decorators: [{
            type: Component,
            args: [{
                    selector: "st-master-detail",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { listTitle: [{
                type: NgInput
            }], detailTitle: [{
                type: NgInput
            }], listItems: [{
                type: NgInput
            }], detailFields: [{
                type: NgInput
            }], detailActions: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=MasterDetail.js.map