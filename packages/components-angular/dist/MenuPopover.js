import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { Menu } from "./Menu.js";
import * as i0 from "@angular/core";
export class MenuPopover {
    static stComponentName = "MenuPopover";
    componentName = "MenuPopover";
    items;
    open;
    placement;
    classInput;
    get hostClass() {
        return ["st-menuPopover", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MenuPopover, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: MenuPopover, isStandalone: true, selector: "st-menu-popover", inputs: { items: "items", open: "open", placement: "placement", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MenuPopover, decorators: [{
            type: Component,
            args: [{
                    selector: "st-menu-popover",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=MenuPopover.js.map