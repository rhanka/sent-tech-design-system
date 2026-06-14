import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class TimePicker {
    static stComponentName = "TimePicker";
    componentName = "TimePicker";
    value;
    onChange;
    step;
    min;
    max;
    format;
    size;
    disabled;
    label;
    classInput;
    id;
    get hostClass() {
        return ["st-timePicker", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TimePicker, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: TimePicker, isStandalone: true, selector: "st-time-picker", inputs: { value: "value", onChange: "onChange", step: "step", min: "min", max: "max", format: "format", size: "size", disabled: "disabled", label: "label", classInput: ["class", "classInput"], id: "id" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TimePicker, decorators: [{
            type: Component,
            args: [{
                    selector: "st-time-picker",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], step: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], format: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], id: [{
                type: NgInput
            }] } });
//# sourceMappingURL=TimePicker.js.map