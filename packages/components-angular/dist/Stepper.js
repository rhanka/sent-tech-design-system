import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Stepper {
    static stComponentName = "Stepper";
    componentName = "Stepper";
    steps;
    current;
    orientation;
    clickable;
    onStepClick;
    label;
    classInput;
    get hostClass() {
        return ["st-stepper", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Stepper, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Stepper, isStandalone: true, selector: "st-stepper", inputs: { steps: "steps", current: "current", orientation: "orientation", clickable: "clickable", onStepClick: "onStepClick", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Stepper, decorators: [{
            type: Component,
            args: [{
                    selector: "st-stepper",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { steps: [{
                type: NgInput
            }], current: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], clickable: [{
                type: NgInput
            }], onStepClick: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Stepper.js.map