import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _counter = 0;
function nextId() {
    return `st-textarea-${++_counter}`;
}
export class Textarea {
    static stComponentName = "Textarea";
    componentName = "Textarea";
    autoId = nextId();
    label;
    helperText;
    errorText;
    invalid;
    modelValue;
    value;
    placeholder;
    disabled;
    readonly;
    rows;
    classInput;
    modelValueChange = new EventEmitter();
    updateModelValue = new EventEmitter();
    input = new EventEmitter();
    change = new EventEmitter();
    get inputId() {
        return this.autoId;
    }
    get currentValue() {
        return this.modelValue ?? this.value ?? "";
    }
    get isInvalid() {
        return this.invalid ?? Boolean(this.errorText);
    }
    get hostClass() {
        return classNames("st-field", this.classInput);
    }
    onInput(event) {
        const val = event.target.value;
        this.modelValueChange.emit(val);
        this.updateModelValue.emit(val);
        this.input.emit(event);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Textarea, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Textarea, isStandalone: true, selector: "st-textarea", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", modelValue: "modelValue", value: "value", placeholder: "placeholder", disabled: "disabled", readonly: "readonly", rows: "rows", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange", updateModelValue: "update:modelValue", input: "input", change: "change" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <textarea
          [id]="inputId"
          class="st-textarea st-control"
          [value]="currentValue"
          [placeholder]="placeholder ?? ''"
          [disabled]="disabled ?? false"
          [attr.readonly]="readonly ? '' : null"
          [attr.rows]="rows"
          [attr.aria-invalid]="isInvalid ? 'true' : null"
          (input)="onInput($event)"
          (change)="change.emit($event)"
        ></textarea>
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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Textarea, decorators: [{
            type: Component,
            args: [{
                    selector: "st-textarea",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <textarea
          [id]="inputId"
          class="st-textarea st-control"
          [value]="currentValue"
          [placeholder]="placeholder ?? ''"
          [disabled]="disabled ?? false"
          [attr.readonly]="readonly ? '' : null"
          [attr.rows]="rows"
          [attr.aria-invalid]="isInvalid ? 'true' : null"
          (input)="onInput($event)"
          (change)="change.emit($event)"
        ></textarea>
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
            }], invalid: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], readonly: [{
                type: NgInput
            }], rows: [{
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
//# sourceMappingURL=Textarea.js.map