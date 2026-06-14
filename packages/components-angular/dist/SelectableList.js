import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { SELECTABLE_LIST_KEY, } from "./SelectableRow.js";
import * as i0 from "@angular/core";
export class SelectableList {
    static stComponentName = "SelectableList";
    componentName = "SelectableList";
    label;
    labelledby;
    multiple;
    value;
    onChange;
    classInput;
    get hostClass() {
        return ["st-selectableList", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectableList, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: SelectableList, isStandalone: true, selector: "st-selectable-list", inputs: { label: "label", labelledby: "labelledby", multiple: "multiple", value: "value", onChange: "onChange", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectableList, decorators: [{
            type: Component,
            args: [{
                    selector: "st-selectable-list",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], labelledby: [{
                type: NgInput
            }], multiple: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SelectableList.js.map