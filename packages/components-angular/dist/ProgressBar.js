import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ProgressBar {
    static stComponentName = "ProgressBar";
    componentName = "ProgressBar";
    label;
    helperText;
    value;
    max;
    tone;
    size;
    indeterminate;
    showValue;
    valueText;
    classInput;
    get hostClass() {
        return classNames("st-progressBar", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressBar, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ProgressBar, isStandalone: true, selector: "st-progress-bar", inputs: { label: "label", helperText: "helperText", value: "value", max: "max", tone: "tone", size: "size", indeterminate: "indeterminate", showValue: "showValue", valueText: "valueText", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressBar, decorators: [{
            type: Component,
            args: [{
                    selector: "st-progress-bar",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], indeterminate: [{
                type: NgInput
            }], showValue: [{
                type: NgInput
            }], valueText: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ProgressBar.js.map