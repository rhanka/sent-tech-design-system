import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class AppHeader {
    static stComponentName = "AppHeader";
    componentName = "AppHeader";
    compact;
    menuOpen;
    menuLabel;
    drawerId;
    brandName;
    productName;
    logoSrc;
    logoAlt;
    brandHref;
    brandLabel;
    classInput;
    get hostClass() {
        return ["st-appHeader", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AppHeader, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: AppHeader, isStandalone: true, selector: "st-app-header", inputs: { compact: "compact", menuOpen: "menuOpen", menuLabel: "menuLabel", drawerId: "drawerId", brandName: "brandName", productName: "productName", logoSrc: "logoSrc", logoAlt: "logoAlt", brandHref: "brandHref", brandLabel: "brandLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AppHeader, decorators: [{
            type: Component,
            args: [{
                    selector: "st-app-header",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { compact: [{
                type: NgInput
            }], menuOpen: [{
                type: NgInput
            }], menuLabel: [{
                type: NgInput
            }], drawerId: [{
                type: NgInput
            }], brandName: [{
                type: NgInput
            }], productName: [{
                type: NgInput
            }], logoSrc: [{
                type: NgInput
            }], logoAlt: [{
                type: NgInput
            }], brandHref: [{
                type: NgInput
            }], brandLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=AppHeader.js.map