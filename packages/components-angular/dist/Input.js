import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Input {
    static stComponentName = "Input";
    componentName = "Input";
    label;
    helperText;
    errorText;
    invalid;
    size;
    id;
    classInput;
    modelValue;
    placeholder;
    disabled;
    readonly;
    get hostClass() {
        return ["st-input", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Input, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Input, isStandalone: true, selector: "st-input", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", size: "size", id: "id", classInput: ["class", "classInput"], modelValue: "modelValue", placeholder: "placeholder", disabled: "disabled", readonly: "readonly" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
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
            }], invalid: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], id: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], modelValue: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], readonly: [{
                type: NgInput
            }] } });
//# sourceMappingURL=Input.js.map