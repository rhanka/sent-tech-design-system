import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _counter = 0;
export class Select {
    static stComponentName = "Select";
    componentName = "Select";
    selectId;
    constructor() {
        _counter++;
        this.selectId = "st-select-" + _counter;
    }
    label;
    helperText;
    errorText;
    invalid;
    size;
    options;
    modelValue;
    value;
    placeholder;
    disabled;
    classInput;
    modelValueChange = new EventEmitter();
    get currentValue() {
        return this.modelValue ?? this.value ?? "";
    }
    get hostClass() {
        return classNames("st-field", this.size ? `st-field--${this.size}` : undefined, this.invalid ? "st-field--invalid" : undefined, this.classInput);
    }
    onChange(e) {
        this.modelValueChange.emit(e.target.value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Select, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Select, isStandalone: true, selector: "st-select", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", size: "size", options: "options", modelValue: "modelValue", value: "value", placeholder: "placeholder", disabled: "disabled", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="selectId">{{ label }}</label>
      }
      <select
        class="st-select"
        [id]="selectId"
        [value]="currentValue"
        [disabled]="disabled ?? false"
        (change)="onChange($event)"
      >
        @if (placeholder) {
          <option value="" disabled selected>{{ placeholder }}</option>
        }
        @for (opt of options ?? []; track opt.value) {
          <option [value]="opt.value" [disabled]="opt.disabled ?? false">{{ opt.label }}</option>
        }
      </select>
      @if (helperText && !invalid) {
        <span class="st-field__helper">{{ helperText }}</span>
      }
      @if (errorText && invalid) {
        <span class="st-field__error">{{ errorText }}</span>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Select, decorators: [{
            type: Component,
            args: [{
                    selector: "st-select",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="selectId">{{ label }}</label>
      }
      <select
        class="st-select"
        [id]="selectId"
        [value]="currentValue"
        [disabled]="disabled ?? false"
        (change)="onChange($event)"
      >
        @if (placeholder) {
          <option value="" disabled selected>{{ placeholder }}</option>
        }
        @for (opt of options ?? []; track opt.value) {
          <option [value]="opt.value" [disabled]="opt.disabled ?? false">{{ opt.label }}</option>
        }
      </select>
      @if (helperText && !invalid) {
        <span class="st-field__helper">{{ helperText }}</span>
      }
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
            }], size: [{
                type: NgInput
            }], options: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], modelValueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=Select.js.map