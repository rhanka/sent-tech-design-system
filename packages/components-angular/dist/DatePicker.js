import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class DatePicker {
    static stComponentName = "DatePicker";
    componentName = "DatePicker";
    label;
    helperText;
    errorText;
    invalid;
    disabled;
    mode;
    modelValue;
    min;
    max;
    locale;
    placeholder;
    size;
    id;
    openLabel;
    previousMonthLabel;
    nextMonthLabel;
    todayLabel;
    classInput;
    get hostClass() {
        return ["st-datePicker", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DatePicker, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: DatePicker, isStandalone: true, selector: "st-date-picker", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", disabled: "disabled", mode: "mode", modelValue: "modelValue", min: "min", max: "max", locale: "locale", placeholder: "placeholder", size: "size", id: "id", openLabel: "openLabel", previousMonthLabel: "previousMonthLabel", nextMonthLabel: "nextMonthLabel", todayLabel: "todayLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DatePicker, decorators: [{
            type: Component,
            args: [{
                    selector: "st-date-picker",
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
            }], invalid: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], mode: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], id: [{
                type: NgInput
            }], openLabel: [{
                type: NgInput
            }], previousMonthLabel: [{
                type: NgInput
            }], nextMonthLabel: [{
                type: NgInput
            }], todayLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DatePicker.js.map