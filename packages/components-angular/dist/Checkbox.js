import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _counter = 0;
function nextId() {
    return `st-checkbox-${++_counter}`;
}
export class Checkbox {
    static stComponentName = "Checkbox";
    componentName = "Checkbox";
    autoId = nextId();
    label;
    helperText;
    description;
    trailing;
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
    get descriptionId() {
        return `${this.autoId}-description`;
    }
    get currentChecked() {
        return this.modelValue ?? this.checked ?? false;
    }
    get hostClass() {
        return classNames("st-choice", "st-choice--checkbox", this.description ? "st-choice--described" : undefined, this.classInput);
    }
    onCheck(event) {
        const checked = event.target.checked;
        this.modelValueChange.emit(checked);
        this.updateModelValue.emit(checked);
        this.change.emit(event);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Checkbox, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Checkbox, isStandalone: true, selector: "st-checkbox", inputs: { label: "label", helperText: "helperText", description: "description", trailing: "trailing", invalid: "invalid", modelValue: "modelValue", checked: "checked", disabled: "disabled", name: "name", value: "value", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange", updateModelValue: "update:modelValue", change: "change" }, ngImport: i0, template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <input
        class="st-choice__input"
        type="checkbox"
        [checked]="currentChecked"
        [disabled]="disabled ?? false"
        [attr.name]="name"
        [attr.value]="value"
        [attr.aria-invalid]="invalid ? 'true' : null"
        [attr.aria-describedby]="description ? descriptionId : null"
        (change)="onCheck($event)"
      />
      <span class="st-choice__content">
        <span class="st-choice__label">{{ label }}</span>
        @if (description) {
          <span class="st-choice__description" [id]="descriptionId">{{ description }}</span>
        }
        @if (helperText) {
          <span class="st-choice__help">{{ helperText }}</span>
        }
      </span>
    </label>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Checkbox, decorators: [{
            type: Component,
            args: [{ selector: "st-checkbox", standalone: true, template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <input
        class="st-choice__input"
        type="checkbox"
        [checked]="currentChecked"
        [disabled]="disabled ?? false"
        [attr.name]="name"
        [attr.value]="value"
        [attr.aria-invalid]="invalid ? 'true' : null"
        [attr.aria-describedby]="description ? descriptionId : null"
        (change)="onCheck($event)"
      />
      <span class="st-choice__content">
        <span class="st-choice__label">{{ label }}</span>
        @if (description) {
          <span class="st-choice__description" [id]="descriptionId">{{ description }}</span>
        }
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
            }], description: [{
                type: NgInput
            }], trailing: [{
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
//# sourceMappingURL=Checkbox.js.map