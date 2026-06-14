import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { Flex } from "./Flex.js";
import * as i0 from "@angular/core";
export class Stack {
    static stComponentName = "Stack";
    componentName = "Stack";
    gap;
    align;
    justify;
    as;
    classInput;
    get hostClass() {
        return ["st-stack", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Stack, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Stack, isStandalone: true, selector: "st-stack", inputs: { gap: "gap", align: "align", justify: "justify", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Stack, decorators: [{
            type: Component,
            args: [{
                    selector: "st-stack",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { gap: [{
                type: NgInput
            }], align: [{
                type: NgInput
            }], justify: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Stack.js.map