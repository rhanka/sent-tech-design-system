import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Slider {
    static stComponentName = "Slider";
    componentName = "Slider";
    label;
    size;
    value;
    defaultValue;
    min;
    max;
    step;
    modelValue;
    helperText;
    errorText;
    invalid;
    showValue;
    disabled;
    valueFormatter;
    classInput;
    modelValueChange = new EventEmitter();
    get currentValue() {
        return this.modelValue ?? this.value ?? this.min ?? 0;
    }
    get hostClass() {
        return classNames("st-field", this.size ? `st-field--${this.size}` : undefined, this.invalid ? "st-field--invalid" : undefined, this.classInput);
    }
    onInput(e) {
        this.modelValueChange.emit(Number(e.target.value));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Slider, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Slider, isStandalone: true, selector: "st-slider", inputs: { label: "label", size: "size", value: "value", defaultValue: "defaultValue", min: "min", max: "max", step: "step", modelValue: "modelValue", helperText: "helperText", errorText: "errorText", invalid: "invalid", showValue: "showValue", disabled: "disabled", valueFormatter: "valueFormatter", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label">
          {{ label }}
          @if (showValue) {
            : {{ currentValue }}
          }
        </label>
      }
      <input
        type="range"
        class="st-slider"
        [min]="min ?? 0"
        [max]="max ?? 100"
        [step]="step ?? 1"
        [value]="currentValue"
        [disabled]="disabled ?? false"
        (input)="onInput($event)"
      />
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Slider, decorators: [{
            type: Component,
            args: [{
                    selector: "st-slider",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label">
          {{ label }}
          @if (showValue) {
            : {{ currentValue }}
          }
        </label>
      }
      <input
        type="range"
        class="st-slider"
        [min]="min ?? 0"
        [max]="max ?? 100"
        [step]="step ?? 1"
        [value]="currentValue"
        [disabled]="disabled ?? false"
        (input)="onInput($event)"
      />
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], size: [{
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
            }], modelValue: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], errorText: [{
                type: NgInput
            }], invalid: [{
                type: NgInput
            }], showValue: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], valueFormatter: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], modelValueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=Slider.js.map