import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class IconButton {
    static stComponentName = "IconButton";
    componentName = "IconButton";
    size;
    variant;
    typeInput;
    disabled;
    classInput;
    get hostClass() {
        return classNames("st-iconButton", this.size && `st-iconButton--${this.size}`, this.variant && `st-iconButton--${this.variant}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: IconButton, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: IconButton, isStandalone: true, selector: "st-icon-button", inputs: { size: "size", variant: "variant", typeInput: ["type", "typeInput"], disabled: "disabled", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: IconButton, decorators: [{
            type: Component,
            args: [{
                    selector: "st-icon-button",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { size: [{
                type: NgInput
            }], variant: [{
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
//# sourceMappingURL=IconButton.js.map