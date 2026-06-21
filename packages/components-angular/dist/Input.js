import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _counter = 0;
function nextId() {
    return `st-input-${++_counter}`;
}
export class Input {
    static stComponentName = "Input";
    componentName = "Input";
    autoId = nextId();
    label;
    helperText;
    errorText;
    invalid;
    size;
    id;
    modelValue;
    value;
    placeholder;
    disabled;
    readonly;
    required;
    name;
    type = "text";
    classInput;
    modelValueChange = new EventEmitter();
    updateModelValue = new EventEmitter();
    input = new EventEmitter();
    change = new EventEmitter();
    get inputId() {
        return this.id ?? this.autoId;
    }
    get currentValue() {
        return this.modelValue ?? this.value ?? "";
    }
    get isInvalid() {
        return this.invalid ?? Boolean(this.errorText);
    }
    get controlClass() {
        return classNames("st-control", `st-control--${this.size ?? "md"}`);
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Input, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Input, isStandalone: true, selector: "st-input", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", size: "size", id: "id", modelValue: "modelValue", value: "value", placeholder: "placeholder", disabled: "disabled", readonly: "readonly", required: "required", name: "name", type: "type", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange", updateModelValue: "update:modelValue", input: "input", change: "change" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <input
          [id]="inputId"
          [class]="controlClass"
          [type]="type"
          [value]="currentValue"
          [placeholder]="placeholder ?? ''"
          [disabled]="disabled ?? false"
          [attr.readonly]="readonly ? '' : null"
          [attr.required]="required ? '' : null"
          [attr.name]="name"
          [attr.aria-invalid]="isInvalid ? 'true' : null"
          (input)="onInput($event)"
          (change)="change.emit($event)"
        />
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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Input, decorators: [{
            type: Component,
            args: [{
                    selector: "st-input",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <input
          [id]="inputId"
          [class]="controlClass"
          [type]="type"
          [value]="currentValue"
          [placeholder]="placeholder ?? ''"
          [disabled]="disabled ?? false"
          [attr.readonly]="readonly ? '' : null"
          [attr.required]="required ? '' : null"
          [attr.name]="name"
          [attr.aria-invalid]="isInvalid ? 'true' : null"
          (input)="onInput($event)"
          (change)="change.emit($event)"
        />
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
            }], size: [{
                type: NgInput
            }], id: [{
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
            }], required: [{
                type: NgInput
            }], name: [{
                type: NgInput
            }], type: [{
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
//# sourceMappingURL=Input.js.map