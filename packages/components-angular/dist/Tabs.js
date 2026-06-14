import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Tabs {
    static stComponentName = "Tabs";
    componentName = "Tabs";
    items;
    activeValue;
    activeId;
    label;
    onchange;
    classInput;
    get hostClass() {
        return ["st-tabs", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tabs, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Tabs, isStandalone: true, selector: "st-tabs", inputs: { items: "items", activeValue: "activeValue", activeId: "activeId", label: "label", onchange: "onchange", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tabs, decorators: [{
            type: Component,
            args: [{
                    selector: "st-tabs",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], activeValue: [{
                type: NgInput
            }], activeId: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], onchange: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Tabs.js.map