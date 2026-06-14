import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class FilterPill {
    static stComponentName = "FilterPill";
    componentName = "FilterPill";
    field;
    value;
    operator;
    active;
    removable;
    disabled;
    tone;
    onClick;
    onRemove;
    classInput;
    get hostClass() {
        return ["st-filterPill", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FilterPill, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: FilterPill, isStandalone: true, selector: "st-filter-pill", inputs: { field: "field", value: "value", operator: "operator", active: "active", removable: "removable", disabled: "disabled", tone: "tone", onClick: "onClick", onRemove: "onRemove", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FilterPill, decorators: [{
            type: Component,
            args: [{
                    selector: "st-filter-pill",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { field: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], operator: [{
                type: NgInput
            }], active: [{
                type: NgInput
            }], removable: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], onClick: [{
                type: NgInput
            }], onRemove: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=FilterPill.js.map