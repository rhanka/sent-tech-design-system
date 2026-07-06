import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Toggle {
    static stComponentName = "Toggle";
    componentName = "Toggle";
    label;
    labelOn = "On";
    labelOff = "Off";
    helperText;
    size;
    modelValue;
    checked;
    disabled;
    name;
    value;
    classInput;
    checkedChange = new EventEmitter();
    modelValueChange = new EventEmitter();
    get isChecked() {
        return this.modelValue ?? this.checked ?? false;
    }
    get hostClass() {
        return classNames("st-toggle", `st-toggle--${this.size ?? "md"}`, this.classInput);
    }
    onChange(e) {
        const next = e.target.checked;
        this.checked = next;
        this.modelValue = next;
        this.checkedChange.emit(next);
        this.modelValueChange.emit(next);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toggle, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Toggle, isStandalone: true, selector: "st-toggle", inputs: { label: "label", labelOn: "labelOn", labelOff: "labelOff", helperText: "helperText", size: "size", modelValue: "modelValue", checked: "checked", disabled: "disabled", name: "name", value: "value", classInput: ["class", "classInput"] }, outputs: { checkedChange: "checkedChange", modelValueChange: "modelValueChange" }, ngImport: i0, template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <span class="st-toggle__label">{{ label }}</span>
      <span class="st-toggle__row">
        <input
          class="st-toggle__input"
          type="checkbox"
          role="switch"
          [name]="name ?? null"
          [value]="value ?? null"
          [checked]="isChecked"
          [disabled]="disabled ?? false"
          [attr.aria-checked]="isChecked ? 'true' : 'false'"
          (change)="onChange($event)"
        />
        <span class="st-toggle__track" aria-hidden="true">
          <span class="st-toggle__thumb"></span>
        </span>
        <span class="st-toggle__state" aria-hidden="true">{{ isChecked ? labelOn : labelOff }}</span>
      </span>
      @if (helperText) {
        <span class="st-toggle__help">{{ helperText }}</span>
      }
    </label>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toggle, decorators: [{
            type: Component,
            args: [{ selector: "st-toggle", standalone: true, template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <span class="st-toggle__label">{{ label }}</span>
      <span class="st-toggle__row">
        <input
          class="st-toggle__input"
          type="checkbox"
          role="switch"
          [name]="name ?? null"
          [value]="value ?? null"
          [checked]="isChecked"
          [disabled]="disabled ?? false"
          [attr.aria-checked]="isChecked ? 'true' : 'false'"
          (change)="onChange($event)"
        />
        <span class="st-toggle__track" aria-hidden="true">
          <span class="st-toggle__thumb"></span>
        </span>
        <span class="st-toggle__state" aria-hidden="true">{{ isChecked ? labelOn : labelOff }}</span>
      </span>
      @if (helperText) {
        <span class="st-toggle__help">{{ helperText }}</span>
      }
    </label>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { label: [{
                type: NgInput
            }], labelOn: [{
                type: NgInput
            }], labelOff: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], size: [{
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
            }], checkedChange: [{
                type: Output
            }], modelValueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=Toggle.js.map