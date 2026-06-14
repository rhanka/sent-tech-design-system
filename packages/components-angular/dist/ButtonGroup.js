import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ButtonGroup {
    static stComponentName = "ButtonGroup";
    componentName = "ButtonGroup";
    orientation;
    attached;
    gap;
    size;
    label;
    classInput;
    get hostClass() {
        return ["st-buttonGroup", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ButtonGroup, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ButtonGroup, isStandalone: true, selector: "st-button-group", inputs: { orientation: "orientation", attached: "attached", gap: "gap", size: "size", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ButtonGroup, decorators: [{
            type: Component,
            args: [{
                    selector: "st-button-group",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { orientation: [{
                type: NgInput
            }], attached: [{
                type: NgInput
            }], gap: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ButtonGroup.js.map