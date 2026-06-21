import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class UtilityPanel {
    static stComponentName = "UtilityPanel";
    componentName = "UtilityPanel";
    mode = "reserve";
    side = "right";
    title;
    label;
    collapsed;
    classInput;
    get hostClass() {
        return ["st-utilityPanel", `st-utilityPanel--${this.mode}`, `st-utilityPanel--${this.side}`, this.collapsed ? "st-utilityPanel--collapsed" : undefined, this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: UtilityPanel, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: UtilityPanel, isStandalone: true, selector: "st-utility-panel", inputs: { mode: "mode", side: "side", title: "title", label: "label", collapsed: "collapsed", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <aside [attr.data-st-component]="componentName" [attr.aria-label]="label || title || 'Utility panel'" [attr.data-mode]="mode" [attr.data-side]="side" [class]="hostClass">
      <ng-content></ng-content>
    </aside>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: UtilityPanel, decorators: [{
            type: Component,
            args: [{
                    selector: "st-utility-panel",
                    standalone: true,
                    template: `
    <aside [attr.data-st-component]="componentName" [attr.aria-label]="label || title || 'Utility panel'" [attr.data-mode]="mode" [attr.data-side]="side" [class]="hostClass">
      <ng-content></ng-content>
    </aside>
  `,
                }]
        }], propDecorators: { mode: [{
                type: NgInput
            }], side: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], collapsed: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=UtilityPanel.js.map