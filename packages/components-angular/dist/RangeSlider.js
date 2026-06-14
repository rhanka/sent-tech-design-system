import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class RangeSlider {
    static stComponentName = "RangeSlider";
    componentName = "RangeSlider";
    modelValue;
    value;
    defaultValue;
    min;
    max;
    step;
    size;
    disabled;
    label;
    helperText;
    errorText;
    invalid;
    showValue;
    valueFormatter;
    ariaLabelMin;
    ariaLabelMax;
    classInput;
    get hostClass() {
        return ["st-rangeSlider", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RangeSlider, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: RangeSlider, isStandalone: true, selector: "st-range-slider", inputs: { modelValue: "modelValue", value: "value", defaultValue: "defaultValue", min: "min", max: "max", step: "step", size: "size", disabled: "disabled", label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", showValue: "showValue", valueFormatter: "valueFormatter", ariaLabelMin: "ariaLabelMin", ariaLabelMax: "ariaLabelMax", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RangeSlider, decorators: [{
            type: Component,
            args: [{
                    selector: "st-range-slider",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { modelValue: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], defaultValue: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], step: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], errorText: [{
                type: NgInput
            }], invalid: [{
                type: NgInput
            }], showValue: [{
                type: NgInput
            }], valueFormatter: [{
                type: NgInput
            }], ariaLabelMin: [{
                type: NgInput
            }], ariaLabelMax: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=RangeSlider.js.map