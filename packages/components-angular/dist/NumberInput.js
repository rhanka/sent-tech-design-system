import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class NumberInput {
    static stComponentName = "NumberInput";
    componentName = "NumberInput";
    label;
    helperText;
    errorText;
    size;
    modelValue;
    value;
    disabled;
    readonly;
    min;
    max;
    step;
    incrementLabel;
    decrementLabel;
    classInput;
    get hostClass() {
        return ["st-numberInput", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NumberInput, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: NumberInput, isStandalone: true, selector: "st-number-input", inputs: { label: "label", helperText: "helperText", errorText: "errorText", size: "size", modelValue: "modelValue", value: "value", disabled: "disabled", readonly: "readonly", min: "min", max: "max", step: "step", incrementLabel: "incrementLabel", decrementLabel: "decrementLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NumberInput, decorators: [{
            type: Component,
            args: [{
                    selector: "st-number-input",
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
            }], errorText: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], readonly: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], step: [{
                type: NgInput
            }], incrementLabel: [{
                type: NgInput
            }], decrementLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NumberInput.js.map