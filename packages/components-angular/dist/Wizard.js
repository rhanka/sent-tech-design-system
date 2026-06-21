import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class Wizard {
    static stComponentName = "Wizard";
    componentName = "Wizard";
    steps = [];
    currentStep = 0;
    stepTitle = "";
    cancelLabel;
    backLabel;
    nextLabel;
    finishLabel;
    isLast = false;
    classInput;
    get hostClass() {
        return ["st-wz", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Wizard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Wizard, isStandalone: true, selector: "st-wizard", inputs: { steps: "steps", currentStep: "currentStep", stepTitle: "stepTitle", cancelLabel: "cancelLabel", backLabel: "backLabel", nextLabel: "nextLabel", finishLabel: "finishLabel", isLast: "isLast", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Wizard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-wizard",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { steps: [{
                type: NgInput
            }], currentStep: [{
                type: NgInput
            }], stepTitle: [{
                type: NgInput
            }], cancelLabel: [{
                type: NgInput
            }], backLabel: [{
                type: NgInput
            }], nextLabel: [{
                type: NgInput
            }], finishLabel: [{
                type: NgInput
            }], isLast: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Wizard.js.map