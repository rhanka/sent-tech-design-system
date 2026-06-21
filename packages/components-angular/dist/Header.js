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
    label;
    compact = false;
    classInput;
    get hostClass() {
        return classNames("st-header", this.compact && "st-header--compact", this.sticky && "st-header--sticky", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Header, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Header, isStandalone: true, selector: "st-header", inputs: { brand: "brand", title: "title", navigation: "navigation", navItems: "navItems", account: "account", sticky: "sticky", label: "label", compact: "compact", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <header [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="label">
      <div class="st-header__body">
        <ng-content select="[slot=logo]"></ng-content>
        <ng-content select="[slot=navigation]"></ng-content>
        <ng-content select="[slot=actions]"></ng-content>
        <ng-content></ng-content>
      </div>
    </header>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Header, decorators: [{
            type: Component,
            args: [{
                    selector: "st-header",
                    standalone: true,
                    template: `
    <header [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="label">
      <div class="st-header__body">
        <ng-content select="[slot=logo]"></ng-content>
        <ng-content select="[slot=navigation]"></ng-content>
        <ng-content select="[slot=actions]"></ng-content>
        <ng-content></ng-content>
      </div>
    </header>
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
            }], label: [{
                type: NgInput
            }], compact: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Header.js.map