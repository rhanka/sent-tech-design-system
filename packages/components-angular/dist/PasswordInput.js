import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class PasswordInput {
    static stComponentName = "PasswordInput";
    componentName = "PasswordInput";
    label;
    helperText;
    errorText;
    size;
    modelValue;
    disabled;
    placeholder;
    classInput;
    get hostClass() {
        return ["st-passwordInput", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PasswordInput, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: PasswordInput, isStandalone: true, selector: "st-password-input", inputs: { label: "label", helperText: "helperText", errorText: "errorText", size: "size", modelValue: "modelValue", disabled: "disabled", placeholder: "placeholder", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
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
      <ng-content></ng-content>
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
            }], disabled: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=PasswordInput.js.map