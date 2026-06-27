import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ProgressBar {
    static stComponentName = "ProgressBar";
    componentName = "ProgressBar";
    label;
    helperText;
    value;
    max;
    tone;
    size;
    indeterminate;
    showValue;
    valueText;
    classInput;
    get resolvedMax() {
        return this.max ?? 100;
    }
    get resolvedTone() {
        return this.tone ?? "neutral";
    }
    get resolvedSize() {
        return this.size ?? "md";
    }
    get clampedValue() {
        const max = this.resolvedMax;
        const value = this.value ?? 0;
        if (max <= 0)
            return 0;
        if (value < 0)
            return 0;
        if (value > max)
            return max;
        return value;
    }
    get percent() {
        return this.indeterminate ? 0 : (this.clampedValue / this.resolvedMax) * 100;
    }
    get fillStyle() {
        return `--st-progressBar-pct: ${this.percent}%`;
    }
    get displayValue() {
        if (this.valueText)
            return this.valueText;
        if (this.indeterminate)
            return "";
        return `${Math.round(this.percent)}%`;
    }
    get trackClass() {
        return classNames("st-progressBar__track", `st-progressBar__track--${this.resolvedSize}`, `st-progressBar__track--${this.resolvedTone}`, this.indeterminate && "st-progressBar__track--indeterminate");
    }
    get hostClass() {
        return classNames("st-progressBar", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressBar, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ProgressBar, isStandalone: true, selector: "st-progress-bar", inputs: { label: "label", helperText: "helperText", value: "value", max: "max", tone: "tone", size: "size", indeterminate: "indeterminate", showValue: "showValue", valueText: "valueText", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label || (showValue && !indeterminate)) {
        <div class="st-progressBar__header">
          @if (label) {
            <span class="st-progressBar__label">{{ label }}</span>
          }
          @if (showValue && !indeterminate) {
            <span class="st-progressBar__value" aria-hidden="true">{{ displayValue }}</span>
          }
        </div>
      }
      <div
        [class]="trackClass"
        role="progressbar"
        [attr.aria-valuemin]="indeterminate ? null : 0"
        [attr.aria-valuemax]="indeterminate ? null : resolvedMax"
        [attr.aria-valuenow]="indeterminate ? null : clampedValue"
        [attr.aria-valuetext]="indeterminate ? null : displayValue"
        [attr.aria-label]="label"
      >
        <div class="st-progressBar__fill" [style]="fillStyle"></div>
      </div>
      @if (helperText) {
        <span class="st-progressBar__help">{{ helperText }}</span>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressBar, decorators: [{
            type: Component,
            args: [{
                    selector: "st-progress-bar",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label || (showValue && !indeterminate)) {
        <div class="st-progressBar__header">
          @if (label) {
            <span class="st-progressBar__label">{{ label }}</span>
          }
          @if (showValue && !indeterminate) {
            <span class="st-progressBar__value" aria-hidden="true">{{ displayValue }}</span>
          }
        </div>
      }
      <div
        [class]="trackClass"
        role="progressbar"
        [attr.aria-valuemin]="indeterminate ? null : 0"
        [attr.aria-valuemax]="indeterminate ? null : resolvedMax"
        [attr.aria-valuenow]="indeterminate ? null : clampedValue"
        [attr.aria-valuetext]="indeterminate ? null : displayValue"
        [attr.aria-label]="label"
      >
        <div class="st-progressBar__fill" [style]="fillStyle"></div>
      </div>
      @if (helperText) {
        <span class="st-progressBar__help">{{ helperText }}</span>
      }
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], indeterminate: [{
                type: NgInput
            }], showValue: [{
                type: NgInput
            }], valueText: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ProgressBar.js.map