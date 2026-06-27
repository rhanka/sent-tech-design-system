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
    showValue = true;
    valueFormatter;
    ariaLabelMin;
    ariaLabelMax;
    classInput;
    valueChange = new EventEmitter();
    get resolvedMin() {
        return this.min ?? 0;
    }
    get resolvedMax() {
        return this.max ?? 100;
    }
    get resolvedStep() {
        return this.step ?? 1;
    }
    get currentValue() {
        return (this.modelValue ??
            this.value ??
            this.defaultValue ?? [this.resolvedMin, this.resolvedMax]);
    }
    get low() {
        return this.currentValue[0];
    }
    get high() {
        return this.currentValue[1];
    }
    get lowPercent() {
        const span = this.resolvedMax - this.resolvedMin;
        return span === 0 ? 0 : ((this.low - this.resolvedMin) / span) * 100;
    }
    get highPercent() {
        const span = this.resolvedMax - this.resolvedMin;
        return span === 0 ? 0 : ((this.high - this.resolvedMin) / span) * 100;
    }
    get fillWidth() {
        return Math.max(0, this.highPercent - this.lowPercent);
    }
    get isInvalid() {
        return Boolean(this.invalid) || Boolean(this.errorText);
    }
    get hostClass() {
        return classNames("st-field", this.classInput);
    }
    get groupClass() {
        return classNames("st-rangeSlider", `st-rangeSlider--${this.size ?? "md"}`, this.disabled && "st-rangeSlider--disabled");
    }
    formatValue(n) {
        return this.valueFormatter ? this.valueFormatter(n) : String(n);
    }
    clampStep(n) {
        if (!Number.isFinite(n))
            return this.resolvedMin;
        let v = Math.min(Math.max(n, this.resolvedMin), this.resolvedMax);
        const step = this.resolvedStep;
        if (Number.isFinite(step) && step > 0) {
            v = this.resolvedMin + Math.round((v - this.resolvedMin) / step) * step;
            v = Math.min(Math.max(v, this.resolvedMin), this.resolvedMax);
        }
        return v;
    }
    setLow(raw) {
        if (this.disabled)
            return;
        const lo = Math.min(this.clampStep(raw), this.high);
        this.valueChange.emit([lo, this.high]);
    }
    setHigh(raw) {
        if (this.disabled)
            return;
        const hi = Math.max(this.clampStep(raw), this.low);
        this.valueChange.emit([this.low, hi]);
    }
    keyDelta(event, value) {
        const step = Number.isFinite(this.resolvedStep) && this.resolvedStep > 0 ? this.resolvedStep : 1;
        const big = step * 10;
        switch (event.key) {
            case "ArrowRight":
            case "ArrowUp":
                return value + step;
            case "ArrowLeft":
            case "ArrowDown":
                return value - step;
            case "PageUp":
                return value + big;
            case "PageDown":
                return value - big;
            case "Home":
                return this.resolvedMin;
            case "End":
                return this.resolvedMax;
            default:
                return null;
        }
    }
    onLowKeydown(event) {
        if (this.disabled)
            return;
        const next = this.keyDelta(event, this.low);
        if (next === null)
            return;
        event.preventDefault();
        this.setLow(next);
    }
    onHighKeydown(event) {
        if (this.disabled)
            return;
        const next = this.keyDelta(event, this.high);
        if (next === null)
            return;
        event.preventDefault();
        this.setHigh(next);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RangeSlider, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: RangeSlider, isStandalone: true, selector: "st-range-slider", inputs: { modelValue: "modelValue", value: "value", defaultValue: "defaultValue", min: "min", max: "max", step: "step", size: "size", disabled: "disabled", label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", showValue: "showValue", valueFormatter: "valueFormatter", ariaLabelMin: "ariaLabelMin", ariaLabelMax: "ariaLabelMax", classInput: ["class", "classInput"] }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-rangeSlider__header">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        @if (showValue) {
          <output class="st-rangeSlider__value" aria-live="polite">{{ formatValue(low) }} – {{ formatValue(high) }}</output>
        }
      </div>
      <span [class]="groupClass">
        <span class="st-rangeSlider__bounds" aria-hidden="true">{{ resolvedMin }}</span>
        <span class="st-rangeSlider__track" [attr.aria-invalid]="isInvalid ? 'true' : null">
          <span
            class="st-rangeSlider__fill"
            [style.left.%]="lowPercent"
            [style.width.%]="fillWidth"
          ></span>
          <span
            class="st-rangeSlider__thumb st-rangeSlider__thumb--low"
            [style.left.%]="lowPercent"
            role="slider"
            [attr.tabindex]="disabled ? -1 : 0"
            [attr.aria-label]="ariaLabelMin ?? 'Valeur minimale'"
            [attr.aria-valuemin]="resolvedMin"
            [attr.aria-valuemax]="high"
            [attr.aria-valuenow]="low"
            [attr.aria-valuetext]="formatValue(low)"
            [attr.aria-disabled]="disabled ? 'true' : null"
            (keydown)="onLowKeydown($event)"
          >
            @if (showValue) {
              <span class="st-rangeSlider__tooltip">{{ formatValue(low) }}</span>
            }
          </span>
          <span
            class="st-rangeSlider__thumb st-rangeSlider__thumb--high"
            [style.left.%]="highPercent"
            role="slider"
            [attr.tabindex]="disabled ? -1 : 0"
            [attr.aria-label]="ariaLabelMax ?? 'Valeur maximale'"
            [attr.aria-valuemin]="low"
            [attr.aria-valuemax]="resolvedMax"
            [attr.aria-valuenow]="high"
            [attr.aria-valuetext]="formatValue(high)"
            [attr.aria-disabled]="disabled ? 'true' : null"
            (keydown)="onHighKeydown($event)"
          >
            @if (showValue) {
              <span class="st-rangeSlider__tooltip">{{ formatValue(high) }}</span>
            }
          </span>
        </span>
        <span class="st-rangeSlider__bounds" aria-hidden="true">{{ resolvedMax }}</span>
      </span>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
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
      <div class="st-rangeSlider__header">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        @if (showValue) {
          <output class="st-rangeSlider__value" aria-live="polite">{{ formatValue(low) }} – {{ formatValue(high) }}</output>
        }
      </div>
      <span [class]="groupClass">
        <span class="st-rangeSlider__bounds" aria-hidden="true">{{ resolvedMin }}</span>
        <span class="st-rangeSlider__track" [attr.aria-invalid]="isInvalid ? 'true' : null">
          <span
            class="st-rangeSlider__fill"
            [style.left.%]="lowPercent"
            [style.width.%]="fillWidth"
          ></span>
          <span
            class="st-rangeSlider__thumb st-rangeSlider__thumb--low"
            [style.left.%]="lowPercent"
            role="slider"
            [attr.tabindex]="disabled ? -1 : 0"
            [attr.aria-label]="ariaLabelMin ?? 'Valeur minimale'"
            [attr.aria-valuemin]="resolvedMin"
            [attr.aria-valuemax]="high"
            [attr.aria-valuenow]="low"
            [attr.aria-valuetext]="formatValue(low)"
            [attr.aria-disabled]="disabled ? 'true' : null"
            (keydown)="onLowKeydown($event)"
          >
            @if (showValue) {
              <span class="st-rangeSlider__tooltip">{{ formatValue(low) }}</span>
            }
          </span>
          <span
            class="st-rangeSlider__thumb st-rangeSlider__thumb--high"
            [style.left.%]="highPercent"
            role="slider"
            [attr.tabindex]="disabled ? -1 : 0"
            [attr.aria-label]="ariaLabelMax ?? 'Valeur maximale'"
            [attr.aria-valuemin]="low"
            [attr.aria-valuemax]="resolvedMax"
            [attr.aria-valuenow]="high"
            [attr.aria-valuetext]="formatValue(high)"
            [attr.aria-disabled]="disabled ? 'true' : null"
            (keydown)="onHighKeydown($event)"
          >
            @if (showValue) {
              <span class="st-rangeSlider__tooltip">{{ formatValue(high) }}</span>
            }
          </span>
        </span>
        <span class="st-rangeSlider__bounds" aria-hidden="true">{{ resolvedMax }}</span>
      </span>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
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