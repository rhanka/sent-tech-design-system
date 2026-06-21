import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _tpCounter = 0;
export class TimePicker {
    static stComponentName = "TimePicker";
    componentName = "TimePicker";
    fieldId;
    constructor() {
        _tpCounter++;
        this.fieldId = "st-time-picker-" + _tpCounter;
    }
    value;
    modelValue;
    onChange;
    step;
    min;
    max;
    format;
    size;
    disabled;
    label;
    placeholder;
    invalid;
    errorText;
    classInput;
    id;
    modelValueChange = new EventEmitter();
    get currentValue() {
        return this.modelValue ?? this.value ?? "";
    }
    get hostClass() {
        return classNames("st-field", this.size ? `st-field--${this.size}` : undefined, this.invalid ? "st-field--invalid" : undefined, this.classInput);
    }
    onInput(e) {
        const val = e.target.value;
        this.modelValueChange.emit(val);
        this.onChange?.(val);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TimePicker, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TimePicker, isStandalone: true, selector: "st-time-picker", inputs: { value: "value", modelValue: "modelValue", onChange: "onChange", step: "step", min: "min", max: "max", format: "format", size: "size", disabled: "disabled", label: "label", placeholder: "placeholder", invalid: "invalid", errorText: "errorText", classInput: ["class", "classInput"], id: "id" }, outputs: { modelValueChange: "modelValueChange" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="fieldId">{{ label }}</label>
      }
      <input
        type="time"
        class="st-timePicker"
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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TimePicker, decorators: [{
            type: Component,
            args: [{
                    selector: "st-time-picker",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="fieldId">{{ label }}</label>
      }
      <input
        type="time"
        class="st-timePicker"
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
        }], ctorParameters: () => [], propDecorators: { value: [{
                type: NgInput
            }], modelValue: [{
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
            }], placeholder: [{
                type: NgInput
            }], invalid: [{
                type: NgInput
            }], errorText: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], id: [{
                type: NgInput
            }], modelValueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=TimePicker.js.map