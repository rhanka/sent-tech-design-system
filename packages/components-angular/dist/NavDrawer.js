import { Component, Input as NgInput } from "@angular/core";
import { Drawer } from "./Drawer.js";
import * as i0 from "@angular/core";
export class NavDrawer {
    static stComponentName = "NavDrawer";
    componentName = "NavDrawer";
    title;
    label;
    open = false;
    side = "left";
    classInput;
    get hostClass() {
        return ["st-navDrawer", "st-navShell", "st-navShell--drawer", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavDrawer, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: NavDrawer, isStandalone: true, selector: "st-nav-drawer", inputs: { title: "title", label: "label", open: "open", side: "side", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <st-drawer [open]="open" [title]="title || label || 'Navigation'" [placement]="side" [class]="hostClass">
      <ng-content></ng-content>
    </st-drawer>
  `, isInline: true, dependencies: [{ kind: "component", type: Drawer, selector: "st-drawer", inputs: ["open", "title", "description", "placement", "closeLabel", "class"], outputs: ["close"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavDrawer, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-drawer",
                    standalone: true,
                    imports: [Drawer],
                    template: `
    <st-drawer [open]="open" [title]="title || label || 'Navigation'" [placement]="side" [class]="hostClass">
      <ng-content></ng-content>
    </st-drawer>
  `,
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], side: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavDrawer.js.map