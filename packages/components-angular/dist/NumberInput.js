import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _counter = 0;
function nextId() {
    return `st-numberInput-${++_counter}`;
}
export class NumberInput {
    static stComponentName = "NumberInput";
    componentName = "NumberInput";
    autoId = nextId();
    label;
    helperText;
    errorText;
    size;
    modelValue;
    value;
    disabled;
    readonly;
    min;
    max;
    step;
    incrementLabel;
    decrementLabel;
    classInput;
    modelValueChange = new EventEmitter();
    updateModelValue = new EventEmitter();
    input = new EventEmitter();
    change = new EventEmitter();
    // Internal value for uncontrolled mode
    _internal = null;
    get inputId() {
        return this.autoId;
    }
    get isInvalid() {
        return Boolean(this.errorText);
    }
    get controlWrapClass() {
        return classNames("st-numberInput", `st-numberInput--${this.size ?? "md"}`);
    }
    get hostClass() {
        return classNames("st-field", this.classInput);
    }
    get numMin() {
        const v = this.min;
        return v !== undefined && v !== "" ? Number(v) : undefined;
    }
    get numMax() {
        const v = this.max;
        return v !== undefined && v !== "" ? Number(v) : undefined;
    }
    get numStep() {
        const v = this.step;
        return v !== undefined && v !== "" ? Number(v) : 1;
    }
    get numValue() {
        const controlled = this.modelValue !== undefined;
        if (controlled) {
            const b = this.modelValue;
            return b === null || b === undefined || b === "" ? null : Number(b);
        }
        const seed = this.value;
        if (this._internal === null && seed !== undefined && seed !== null && seed !== "") {
            return Number(seed);
        }
        return this._internal;
    }
    get currentValue() {
        return this.numValue ?? "";
    }
    get isAtMin() {
        const n = this.numValue;
        return n !== null && this.numMin !== undefined && n <= this.numMin;
    }
    get isAtMax() {
        const n = this.numValue;
        return n !== null && this.numMax !== undefined && n >= this.numMax;
    }
    clamp(n) {
        if (this.numMin !== undefined && n < this.numMin)
            return this.numMin;
        if (this.numMax !== undefined && n > this.numMax)
            return this.numMax;
        return n;
    }
    setValue(next) {
        if (this.modelValue === undefined) {
            this._internal = next;
        }
        this.modelValueChange.emit(next);
        this.updateModelValue.emit(next);
    }
    increment() {
        this.setValue(this.clamp((this.numValue ?? this.numMin ?? 0) + this.numStep));
    }
    decrement() {
        this.setValue(this.clamp((this.numValue ?? this.numMax ?? 0) - this.numStep));
    }
    onInput(event) {
        const raw = event.target.value;
        const next = raw === "" ? null : Number.isFinite(Number(raw)) ? Number(raw) : this.numValue;
        this.setValue(next);
        this.input.emit(event);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NumberInput, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NumberInput, isStandalone: true, selector: "st-number-input", inputs: { label: "label", helperText: "helperText", errorText: "errorText", size: "size", modelValue: "modelValue", value: "value", disabled: "disabled", readonly: "readonly", min: "min", max: "max", step: "step", incrementLabel: "incrementLabel", decrementLabel: "decrementLabel", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange", updateModelValue: "update:modelValue", input: "input", change: "change" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <span [class]="controlWrapClass">
          <input
            [id]="inputId"
            class="st-numberInput__control"
            type="number"
            [value]="currentValue"
            [disabled]="disabled ?? false"
            [attr.readonly]="readonly ? '' : null"
            [attr.min]="min"
            [attr.max]="max"
            [attr.step]="step"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            (input)="onInput($event)"
            (change)="change.emit($event)"
          />
          <span class="st-numberInput__buttons">
            <button
              type="button"
              class="st-numberInput__button"
              [attr.aria-label]="decrementLabel ?? 'Decrement value'"
              [disabled]="disabled || isAtMin"
              (click)="decrement()"
            ><span aria-hidden="true">−</span></button>
            <button
              type="button"
              class="st-numberInput__button"
              [attr.aria-label]="incrementLabel ?? 'Increment value'"
              [disabled]="disabled || isAtMax"
              (click)="increment()"
            ><span aria-hidden="true">+</span></button>
          </span>
        </span>
      </label>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      }
      @if (!errorText && helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NumberInput, decorators: [{
            type: Component,
            args: [{
                    selector: "st-number-input",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <span [class]="controlWrapClass">
          <input
            [id]="inputId"
            class="st-numberInput__control"
            type="number"
            [value]="currentValue"
            [disabled]="disabled ?? false"
            [attr.readonly]="readonly ? '' : null"
            [attr.min]="min"
            [attr.max]="max"
            [attr.step]="step"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            (input)="onInput($event)"
            (change)="change.emit($event)"
          />
          <span class="st-numberInput__buttons">
            <button
              type="button"
              class="st-numberInput__button"
              [attr.aria-label]="decrementLabel ?? 'Decrement value'"
              [disabled]="disabled || isAtMin"
              (click)="decrement()"
            ><span aria-hidden="true">−</span></button>
            <button
              type="button"
              class="st-numberInput__button"
              [attr.aria-label]="incrementLabel ?? 'Increment value'"
              [disabled]="disabled || isAtMax"
              (click)="increment()"
            ><span aria-hidden="true">+</span></button>
          </span>
        </span>
      </label>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      }
      @if (!errorText && helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], errorText: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], readonly: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], step: [{
                type: NgInput
            }], incrementLabel: [{
                type: NgInput
            }], decrementLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], modelValueChange: [{
                type: Output
            }], updateModelValue: [{
                type: Output,
                args: ["update:modelValue"]
            }], input: [{
                type: Output
            }], change: [{
                type: Output
            }] } });
//# sourceMappingURL=NumberInput.js.map