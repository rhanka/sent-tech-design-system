import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Radio {
    static stComponentName = "Radio";
    componentName = "Radio";
    label;
    helperText;
    invalid;
    modelValue;
    checked;
    disabled;
    name;
    value;
    classInput;
    modelValueChange = new EventEmitter();
    updateModelValue = new EventEmitter();
    change = new EventEmitter();
    get currentChecked() {
        if (this.checked !== undefined)
            return this.checked;
        if (this.modelValue !== undefined && this.value !== undefined) {
            return this.modelValue === this.value;
        }
        return false;
    }
    get hostClass() {
        return classNames("st-choice", "st-choice--radio", this.classInput);
    }
    onRadioChange(event) {
        const val = event.target.value;
        this.modelValueChange.emit(val);
        this.updateModelValue.emit(val);
        this.change.emit(event);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Radio, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Radio, isStandalone: true, selector: "st-radio", inputs: { label: "label", helperText: "helperText", invalid: "invalid", modelValue: "modelValue", checked: "checked", disabled: "disabled", name: "name", value: "value", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange", updateModelValue: "update:modelValue", change: "change" }, ngImport: i0, template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <input
        class="st-choice__input"
        type="radio"
        [checked]="currentChecked"
        [disabled]="disabled ?? false"
        [attr.name]="name"
        [attr.value]="value"
        [attr.aria-invalid]="invalid ? 'true' : null"
        (change)="onRadioChange($event)"
      />
      <span class="st-choice__content">
        <span class="st-choice__label">{{ label }}</span>
        @if (helperText) {
          <span class="st-choice__help">{{ helperText }}</span>
        }
      </span>
    </label>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Radio, decorators: [{
            type: Component,
            args: [{ selector: "st-radio", standalone: true, template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <input
        class="st-choice__input"
        type="radio"
        [checked]="currentChecked"
        [disabled]="disabled ?? false"
        [attr.name]="name"
        [attr.value]="value"
        [attr.aria-invalid]="invalid ? 'true' : null"
        (change)="onRadioChange($event)"
      />
      <span class="st-choice__content">
        <span class="st-choice__label">{{ label }}</span>
        @if (helperText) {
          <span class="st-choice__help">{{ helperText }}</span>
        }
      </span>
    </label>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { label: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], invalid: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], checked: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], name: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], modelValueChange: [{
                type: Output
            }], updateModelValue: [{
                type: Output,
                args: ["update:modelValue"]
            }], change: [{
                type: Output
            }] } });
//# sourceMappingURL=Radio.js.map