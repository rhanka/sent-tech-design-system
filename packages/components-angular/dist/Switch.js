import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Switch {
    static stComponentName = "Switch";
    componentName = "Switch";
    label;
    helperText;
    modelValue;
    checked;
    disabled;
    name;
    value;
    classInput;
    get hostClass() {
        return ["st-switch", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Switch, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Switch, isStandalone: true, selector: "st-switch", inputs: { label: "label", helperText: "helperText", modelValue: "modelValue", checked: "checked", disabled: "disabled", name: "name", value: "value", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <input
        class="st-switch__input"
        type="checkbox"
        role="switch"
        [checked]="checked ?? false"
        [attr.aria-checked]="(checked ?? false) ? 'true' : 'false'"
        [disabled]="disabled ?? false"
        [attr.name]="name ?? null"
        [attr.value]="value ?? null"
      />
      <span class="st-switch__track" aria-hidden="true">
        <span class="st-switch__thumb"></span>
      </span>
      <span class="st-switch__content">
        <span class="st-switch__label">{{ label }}</span>
        @if (helperText) {
          <span class="st-switch__help">{{ helperText }}</span>
        }
      </span>
    </label>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Switch, decorators: [{
            type: Component,
            args: [{ selector: "st-switch", standalone: true, template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <input
        class="st-switch__input"
        type="checkbox"
        role="switch"
        [checked]="checked ?? false"
        [attr.aria-checked]="(checked ?? false) ? 'true' : 'false'"
        [disabled]="disabled ?? false"
        [attr.name]="name ?? null"
        [attr.value]="value ?? null"
      />
      <span class="st-switch__track" aria-hidden="true">
        <span class="st-switch__thumb"></span>
      </span>
      <span class="st-switch__content">
        <span class="st-switch__label">{{ label }}</span>
        @if (helperText) {
          <span class="st-switch__help">{{ helperText }}</span>
        }
      </span>
    </label>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { label: [{
                type: NgInput
            }], helperText: [{
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
            }] } });
//# sourceMappingURL=Switch.js.map