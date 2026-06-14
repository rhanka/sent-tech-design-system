import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { Menu } from "./Menu.js";
import * as i0 from "@angular/core";
export class OverflowMenu {
    static stComponentName = "OverflowMenu";
    componentName = "OverflowMenu";
    items;
    label;
    open;
    dense;
    placement;
    classInput;
    get hostClass() {
        return ["st-overflowMenu", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OverflowMenu, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: OverflowMenu, isStandalone: true, selector: "st-overflow-menu", inputs: { items: "items", label: "label", open: "open", dense: "dense", placement: "placement", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OverflowMenu, decorators: [{
            type: Component,
            args: [{
                    selector: "st-overflow-menu",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], dense: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=OverflowMenu.js.map