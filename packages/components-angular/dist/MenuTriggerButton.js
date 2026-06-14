import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class MenuTriggerButton {
    static stComponentName = "MenuTriggerButton";
    componentName = "MenuTriggerButton";
    open;
    expanded;
    size;
    variant;
    disabled;
    classInput;
    get hostClass() {
        return ["st-menuTriggerButton", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MenuTriggerButton, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: MenuTriggerButton, isStandalone: true, selector: "st-menu-trigger-button", inputs: { open: "open", expanded: "expanded", size: "size", variant: "variant", disabled: "disabled", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MenuTriggerButton, decorators: [{
            type: Component,
            args: [{
                    selector: "st-menu-trigger-button",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { open: [{
                type: NgInput
            }], expanded: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=MenuTriggerButton.js.map