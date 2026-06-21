import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _counter = 0;
function nextId() {
    return `st-passwordInput-${++_counter}`;
}
export class PasswordInput {
    static stComponentName = "PasswordInput";
    componentName = "PasswordInput";
    autoId = nextId();
    showPassword = false;
    label;
    helperText;
    errorText;
    size;
    modelValue;
    value;
    disabled;
    placeholder;
    showLabel;
    hideLabel;
    classInput;
    modelValueChange = new EventEmitter();
    updateModelValue = new EventEmitter();
    input = new EventEmitter();
    change = new EventEmitter();
    get inputId() {
        return this.autoId;
    }
    get inputType() {
        return this.showPassword ? "text" : "password";
    }
    get currentValue() {
        return this.modelValue ?? this.value ?? "";
    }
    get isInvalid() {
        return Boolean(this.errorText);
    }
    get controlWrapClass() {
        return classNames("st-passwordInput", `st-passwordInput--${this.size ?? "md"}`);
    }
    get hostClass() {
        return classNames("st-field", this.classInput);
    }
    toggleVisibility() {
        this.showPassword = !this.showPassword;
    }
    onInput(event) {
        const val = event.target.value;
        this.modelValueChange.emit(val);
        this.updateModelValue.emit(val);
        this.input.emit(event);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PasswordInput, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: PasswordInput, isStandalone: true, selector: "st-password-input", inputs: { label: "label", helperText: "helperText", errorText: "errorText", size: "size", modelValue: "modelValue", value: "value", disabled: "disabled", placeholder: "placeholder", showLabel: "showLabel", hideLabel: "hideLabel", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange", updateModelValue: "update:modelValue", input: "input", change: "change" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <span [class]="controlWrapClass">
          <input
            [id]="inputId"
            class="st-passwordInput__control"
            [type]="inputType"
            [value]="currentValue"
            [placeholder]="placeholder ?? ''"
            [disabled]="disabled ?? false"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            (input)="onInput($event)"
            (change)="change.emit($event)"
          />
          <button
            type="button"
            class="st-passwordInput__toggle"
            [attr.aria-label]="showPassword ? (hideLabel ?? 'Hide password') : (showLabel ?? 'Show password')"
            [attr.aria-pressed]="showPassword ? 'true' : 'false'"
            (click)="toggleVisibility()"
          >
            @if (showPassword) {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            }
          </button>
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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PasswordInput, decorators: [{
            type: Component,
            args: [{
                    selector: "st-password-input",
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
            class="st-passwordInput__control"
            [type]="inputType"
            [value]="currentValue"
            [placeholder]="placeholder ?? ''"
            [disabled]="disabled ?? false"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            (input)="onInput($event)"
            (change)="change.emit($event)"
          />
          <button
            type="button"
            class="st-passwordInput__toggle"
            [attr.aria-label]="showPassword ? (hideLabel ?? 'Hide password') : (showLabel ?? 'Show password')"
            [attr.aria-pressed]="showPassword ? 'true' : 'false'"
            (click)="toggleVisibility()"
          >
            @if (showPassword) {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            }
          </button>
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
            }], placeholder: [{
                type: NgInput
            }], showLabel: [{
                type: NgInput
            }], hideLabel: [{
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
//# sourceMappingURL=PasswordInput.js.map