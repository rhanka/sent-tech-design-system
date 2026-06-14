import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export function deriveInitials(name) {
    return (name ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}
export class Header {
    static stComponentName = "Header";
    componentName = "Header";
    brand;
    title;
    navigation;
    navItems;
    account;
    sticky;
    classInput;
    get hostClass() {
        return ["st-header", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Header, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Header, isStandalone: true, selector: "st-header", inputs: { brand: "brand", title: "title", navigation: "navigation", navItems: "navItems", account: "account", sticky: "sticky", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Header, decorators: [{
            type: Component,
            args: [{
                    selector: "st-header",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { brand: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], navigation: [{
                type: NgInput
            }], navItems: [{
                type: NgInput
            }], account: [{
                type: NgInput
            }], sticky: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Header.js.map