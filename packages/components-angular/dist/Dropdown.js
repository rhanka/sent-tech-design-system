import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Dropdown {
    static stComponentName = "Dropdown";
    componentName = "Dropdown";
    label;
    options;
    value;
    open;
    placeholder;
    onSelect;
    classInput;
    get hostClass() {
        return ["st-dropdown", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Dropdown, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Dropdown, isStandalone: true, selector: "st-dropdown", inputs: { label: "label", options: "options", value: "value", open: "open", placeholder: "placeholder", onSelect: "onSelect", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Dropdown, decorators: [{
            type: Component,
            args: [{
                    selector: "st-dropdown",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], options: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], onSelect: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Dropdown.js.map