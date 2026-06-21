import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _dpCounter = 0;
export class DatePicker {
    static stComponentName = "DatePicker";
    componentName = "DatePicker";
    fieldId;
    constructor() {
        _dpCounter++;
        this.fieldId = "st-date-picker-" + _dpCounter;
    }
    label;
    helperText;
    errorText;
    invalid;
    disabled;
    mode;
    modelValue;
    value;
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
    modelValueChange = new EventEmitter();
    get currentValue() {
        if (typeof this.value === "string")
            return this.value;
        return "";
    }
    get hostClass() {
        return classNames("st-field", this.size ? `st-field--${this.size}` : undefined, this.invalid ? "st-field--invalid" : undefined, this.classInput);
    }
    onInput(e) {
        this.modelValueChange.emit(e.target.value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DatePicker, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: DatePicker, isStandalone: true, selector: "st-date-picker", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", disabled: "disabled", mode: "mode", modelValue: "modelValue", value: "value", min: "min", max: "max", locale: "locale", placeholder: "placeholder", size: "size", id: "id", openLabel: "openLabel", previousMonthLabel: "previousMonthLabel", nextMonthLabel: "nextMonthLabel", todayLabel: "todayLabel", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="fieldId">{{ label }}</label>
      }
      <input
        type="date"
        class="st-datePicker"
        [id]="fieldId"
        [value]="currentValue"
        [attr.min]="min ?? null"
        [attr.max]="max ?? null"
        [disabled]="disabled ?? false"
        (input)="onInput($event)"
      />
      @if (errorText && invalid) {
        <span class="st-field__error">{{ errorText }}</span>
      }
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
      @if (label) {
        <label class="st-field__label" [attr.for]="fieldId">{{ label }}</label>
      }
      <input
        type="date"
        class="st-datePicker"
        [id]="fieldId"
        [value]="currentValue"
        [attr.min]="min ?? null"
        [attr.max]="max ?? null"
        [disabled]="disabled ?? false"
        (input)="onInput($event)"
      />
      @if (errorText && invalid) {
        <span class="st-field__error">{{ errorText }}</span>
      }
    </div>
  `,
                }]
        }], ctorParameters: () => [], propDecorators: { label: [{
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
            }], value: [{
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
            }], modelValueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=DatePicker.js.map