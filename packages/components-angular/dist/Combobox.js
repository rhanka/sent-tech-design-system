import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Combobox {
    static stComponentName = "Combobox";
    componentName = "Combobox";
    label;
    helperText;
    errorText;
    invalid;
    options;
    value;
    size;
    placeholder;
    disabled;
    open;
    allowCustomValue;
    noResultsLabel;
    listLabel;
    classInput;
    get hostClass() {
        return ["st-combobox", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Combobox, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Combobox, isStandalone: true, selector: "st-combobox", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", options: "options", value: "value", size: "size", placeholder: "placeholder", disabled: "disabled", open: "open", allowCustomValue: "allowCustomValue", noResultsLabel: "noResultsLabel", listLabel: "listLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Combobox, decorators: [{
            type: Component,
            args: [{
                    selector: "st-combobox",
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
            }], options: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], allowCustomValue: [{
                type: NgInput
            }], noResultsLabel: [{
                type: NgInput
            }], listLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Combobox.js.map