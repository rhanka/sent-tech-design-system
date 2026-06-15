import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Checkbox {
    static stComponentName = "Checkbox";
    componentName = "Checkbox";
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
    get hostClass() {
        return ["st-checkbox", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Checkbox, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Checkbox, isStandalone: true, selector: "st-checkbox", inputs: { label: "label", helperText: "helperText", description: "description", trailing: "trailing", invalid: "invalid", modelValue: "modelValue", checked: "checked", disabled: "disabled", name: "name", value: "value", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Checkbox, decorators: [{
            type: Component,
            args: [{
                    selector: "st-checkbox",
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
            }] } });
//# sourceMappingURL=Checkbox.js.map