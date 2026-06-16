import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class NavSection {
    static stComponentName = "NavSection";
    componentName = "NavSection";
    label;
    count;
    collapsible;
    open;
    as;
    classInput;
    get hostClass() {
        return classNames("st-navSection", this.collapsible ? "st-navSection--collapsible" : "st-navSection--static", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavSection, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: NavSection, isStandalone: true, selector: "st-nav-section", inputs: { label: "label", count: "count", collapsible: "collapsible", open: "open", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavSection, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-section",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], count: [{
                type: NgInput
            }], collapsible: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavSection.js.map