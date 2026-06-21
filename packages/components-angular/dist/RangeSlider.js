import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
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
    valueChange = new EventEmitter();
    get currentValue() {
        return this.modelValue ?? this.value ?? [this.min ?? 0, this.max ?? 100];
    }
    get low() {
        return this.currentValue[0];
    }
    get high() {
        return this.currentValue[1];
    }
    get hostClass() {
        return classNames("st-field", this.size ? `st-field--${this.size}` : undefined, this.invalid ? "st-field--invalid" : undefined, this.classInput);
    }
    formatValue(n) {
        return this.valueFormatter ? this.valueFormatter(n) : String(n);
    }
    onLow(e) {
        this.valueChange.emit([Number(e.target.value), this.high]);
    }
    onHigh(e) {
        this.valueChange.emit([this.low, Number(e.target.value)]);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RangeSlider, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: RangeSlider, isStandalone: true, selector: "st-range-slider", inputs: { modelValue: "modelValue", value: "value", defaultValue: "defaultValue", min: "min", max: "max", step: "step", size: "size", disabled: "disabled", label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", showValue: "showValue", valueFormatter: "valueFormatter", ariaLabelMin: "ariaLabelMin", ariaLabelMax: "ariaLabelMax", classInput: ["class", "classInput"] }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label">{{ label }}</label>
      }
      <div class="st-rangeSlider">
        <input
          type="range"
          class="st-rangeSlider__thumb st-rangeSlider__thumb--low"
          [min]="min ?? 0"
          [max]="high"
          [step]="step ?? 1"
          [value]="low"
          [disabled]="disabled ?? false"
          [attr.aria-label]="ariaLabelMin ?? 'Minimum value'"
          (input)="onLow($event)"
        />
        <input
          type="range"
          class="st-rangeSlider__thumb st-rangeSlider__thumb--high"
          [min]="low"
          [max]="max ?? 100"
          [step]="step ?? 1"
          [value]="high"
          [disabled]="disabled ?? false"
          [attr.aria-label]="ariaLabelMax ?? 'Maximum value'"
          (input)="onHigh($event)"
        />
      </div>
      @if (showValue) {
        <span class="st-rangeSlider__values">{{ formatValue(low) }} – {{ formatValue(high) }}</span>
      }
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      }
      @if (!errorText && helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
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
      @if (label) {
        <label class="st-field__label">{{ label }}</label>
      }
      <div class="st-rangeSlider">
        <input
          type="range"
          class="st-rangeSlider__thumb st-rangeSlider__thumb--low"
          [min]="min ?? 0"
          [max]="high"
          [step]="step ?? 1"
          [value]="low"
          [disabled]="disabled ?? false"
          [attr.aria-label]="ariaLabelMin ?? 'Minimum value'"
          (input)="onLow($event)"
        />
        <input
          type="range"
          class="st-rangeSlider__thumb st-rangeSlider__thumb--high"
          [min]="low"
          [max]="max ?? 100"
          [step]="step ?? 1"
          [value]="high"
          [disabled]="disabled ?? false"
          [attr.aria-label]="ariaLabelMax ?? 'Maximum value'"
          (input)="onHigh($event)"
        />
      </div>
      @if (showValue) {
        <span class="st-rangeSlider__values">{{ formatValue(low) }} – {{ formatValue(high) }}</span>
      }
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      }
      @if (!errorText && helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
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
            }], valueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=RangeSlider.js.map