import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Search {
    static stComponentName = "Search";
    componentName = "Search";
    label;
    size;
    modelValue;
    value;
    placeholder;
    clearLabel;
    fluid;
    disabled;
    id;
    classInput;
    get hostClass() {
        return ["st-search", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Search, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Search, isStandalone: true, selector: "st-search", inputs: { label: "label", size: "size", modelValue: "modelValue", value: "value", placeholder: "placeholder", clearLabel: "clearLabel", fluid: "fluid", disabled: "disabled", id: "id", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Search, decorators: [{
            type: Component,
            args: [{
                    selector: "st-search",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], clearLabel: [{
                type: NgInput
            }], fluid: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], id: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Search.js.map