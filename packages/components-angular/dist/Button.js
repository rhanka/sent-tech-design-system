import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Button {
    static stComponentName = "Button";
    componentName = "Button";
    variant;
    size;
    typeInput;
    disabled;
    classInput;
    get hostClass() {
        return classNames("st-button", this.variant && `st-button--${this.variant}`, this.size && `st-button--${this.size}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Button, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Button, isStandalone: true, selector: "st-button", inputs: { variant: "variant", size: "size", typeInput: ["type", "typeInput"], disabled: "disabled", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Button, decorators: [{
            type: Component,
            args: [{
                    selector: "st-button",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { variant: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], typeInput: [{
                type: NgInput,
                args: ["type"]
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Button.js.map