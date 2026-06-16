import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class NavItem {
    static stComponentName = "NavItem";
    componentName = "NavItem";
    value;
    title;
    caption;
    depth;
    swatch;
    count;
    status;
    selected;
    disabled;
    href;
    divider;
    classInput;
    get hostClass() {
        const depth = Math.min(Math.max(Math.trunc(Number(this.depth) || 0), 0), 3);
        const status = this.status ?? "neutral";
        return classNames("st-navItem", `st-navItem--depth${depth}`, status !== "neutral" ? `st-navItem--status-${status}` : null, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavItem, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: NavItem, isStandalone: true, selector: "st-nav-item", inputs: { value: "value", title: "title", caption: "caption", depth: "depth", swatch: "swatch", count: "count", status: "status", selected: "selected", disabled: "disabled", href: "href", divider: "divider", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavItem, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-item",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], caption: [{
                type: NgInput
            }], depth: [{
                type: NgInput
            }], swatch: [{
                type: NgInput
            }], count: [{
                type: NgInput
            }], status: [{
                type: NgInput
            }], selected: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], href: [{
                type: NgInput
            }], divider: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavItem.js.map