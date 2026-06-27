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
    change = new EventEmitter();
    get resolvedMin() {
        return this.min ?? 0;
    }
    get resolvedMax() {
        return this.max ?? 100;
    }
    get resolvedStep() {
        return this.step ?? 1;
    }
    // showValue defaults to true (Svelte default).
    get showValueResolved() {
        return this.showValue ?? true;
    }
    get rawValue() {
        return this.modelValue ?? this.value ?? this.resolvedMin;
    }
    get safeValue() {
        const v = this.rawValue;
        const min = this.resolvedMin;
        const max = this.resolvedMax;
        if (typeof v !== "number" || Number.isNaN(v))
            return min;
        if (v < min)
            return min;
        if (v > max)
            return max;
        return v;
    }
    get percent() {
        const min = this.resolvedMin;
        const max = this.resolvedMax;
        if (max === min)
            return 0;
        return ((this.safeValue - min) / (max - min)) * 100;
    }
    get fillStyle() {
        return `--st-slider-fill: ${this.percent}%`;
    }
    get formatted() {
        return this.valueFormatter ? this.valueFormatter(this.safeValue) : String(this.safeValue);
    }
    get isInvalid() {
        return Boolean(this.invalid) || Boolean(this.errorText);
    }
    get groupClass() {
        return classNames("st-slider", `st-slider--${this.size ?? "md"}`);
    }
    get hostClass() {
        return classNames("st-field", this.classInput);
    }
    onInput(e) {
        const next = Number(e.target.value);
        if (Number.isFinite(next)) {
            this.modelValueChange.emit(next);
            this.change.emit(next);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Slider, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Slider, isStandalone: true, selector: "st-slider", inputs: { label: "label", size: "size", value: "value", defaultValue: "defaultValue", min: "min", max: "max", step: "step", modelValue: "modelValue", helperText: "helperText", errorText: "errorText", invalid: "invalid", showValue: "showValue", disabled: "disabled", valueFormatter: "valueFormatter", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange", change: "change" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-slider__header">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        @if (showValueResolved) {
          <output class="st-slider__value" aria-live="polite">{{ formatted }}</output>
        }
      </div>
      <span [class]="groupClass">
        <span class="st-slider__bounds" aria-hidden="true">{{ resolvedMin }}</span>
        <span class="st-slider__track">
          <span class="st-slider__fill" [style]="fillStyle"></span>
          <span class="st-slider__thumb" [style.left]="percent + '%'" aria-hidden="true">
            @if (showValueResolved) {
              <span class="st-slider__tooltip">{{ formatted }}</span>
            }
          </span>
          <input
            type="range"
            class="st-slider__input"
            [attr.aria-label]="label"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            [value]="safeValue"
            [min]="resolvedMin"
            [max]="resolvedMax"
            [step]="resolvedStep"
            [disabled]="disabled ?? false"
            (input)="onInput($event)"
          />
        </span>
        <span class="st-slider__bounds" aria-hidden="true">{{ resolvedMax }}</span>
      </span>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
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
      <div class="st-slider__header">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        @if (showValueResolved) {
          <output class="st-slider__value" aria-live="polite">{{ formatted }}</output>
        }
      </div>
      <span [class]="groupClass">
        <span class="st-slider__bounds" aria-hidden="true">{{ resolvedMin }}</span>
        <span class="st-slider__track">
          <span class="st-slider__fill" [style]="fillStyle"></span>
          <span class="st-slider__thumb" [style.left]="percent + '%'" aria-hidden="true">
            @if (showValueResolved) {
              <span class="st-slider__tooltip">{{ formatted }}</span>
            }
          </span>
          <input
            type="range"
            class="st-slider__input"
            [attr.aria-label]="label"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            [value]="safeValue"
            [min]="resolvedMin"
            [max]="resolvedMax"
            [step]="resolvedStep"
            [disabled]="disabled ?? false"
            (input)="onInput($event)"
          />
        </span>
        <span class="st-slider__bounds" aria-hidden="true">{{ resolvedMax }}</span>
      </span>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
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
            }], change: [{
                type: Output
            }] } });
//# sourceMappingURL=Slider.js.map