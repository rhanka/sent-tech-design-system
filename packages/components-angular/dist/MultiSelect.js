import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class MultiSelect {
    static stComponentName = "MultiSelect";
    componentName = "MultiSelect";
    label;
    helperText;
    errorText;
    invalid;
    options;
    value;
    values;
    selected;
    size;
    open;
    placeholder;
    searchPlaceholder;
    noResultsLabel;
    toggleLabel;
    removeLabel;
    listLabel;
    disabled;
    classInput;
    get hostClass() {
        return ["st-multiSelect", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MultiSelect, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: MultiSelect, isStandalone: true, selector: "st-multi-select", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", options: "options", value: "value", values: "values", selected: "selected", size: "size", open: "open", placeholder: "placeholder", searchPlaceholder: "searchPlaceholder", noResultsLabel: "noResultsLabel", toggleLabel: "toggleLabel", removeLabel: "removeLabel", listLabel: "listLabel", disabled: "disabled", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MultiSelect, decorators: [{
            type: Component,
            args: [{
                    selector: "st-multi-select",
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
            }], values: [{
                type: NgInput
            }], selected: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], searchPlaceholder: [{
                type: NgInput
            }], noResultsLabel: [{
                type: NgInput
            }], toggleLabel: [{
                type: NgInput
            }], removeLabel: [{
                type: NgInput
            }], listLabel: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=MultiSelect.js.map