import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ProgressIndicator {
    static stComponentName = "ProgressIndicator";
    componentName = "ProgressIndicator";
    items;
    orientation;
    vertical;
    label;
    classInput;
    get hostClass() {
        return ["st-progressIndicator", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressIndicator, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ProgressIndicator, isStandalone: true, selector: "st-progress-indicator", inputs: { items: "items", orientation: "orientation", vertical: "vertical", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressIndicator, decorators: [{
            type: Component,
            args: [{
                    selector: "st-progress-indicator",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], vertical: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ProgressIndicator.js.map