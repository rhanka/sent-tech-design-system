import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { spacingToken } from "./Flex.js";
import * as i0 from "@angular/core";
export class Divider {
    static stComponentName = "Divider";
    componentName = "Divider";
    orientation;
    spacing;
    label;
    variant;
    classInput;
    get hostClass() {
        return ["st-divider", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Divider, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Divider, isStandalone: true, selector: "st-divider", inputs: { orientation: "orientation", spacing: "spacing", label: "label", variant: "variant", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Divider, decorators: [{
            type: Component,
            args: [{
                    selector: "st-divider",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { orientation: [{
                type: NgInput
            }], spacing: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Divider.js.map