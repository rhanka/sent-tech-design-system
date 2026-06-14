import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export function identityInitial(user) {
    const source = user?.displayName || user?.email || "U";
    return source.charAt(0).toUpperCase();
}
export class IdentityMenu {
    static stComponentName = "IdentityMenu";
    componentName = "IdentityMenu";
    user;
    isAuthenticated;
    open;
    devicesHref;
    settingsHref;
    loginLabel;
    devicesLabel;
    settingsLabel;
    logoutLabel;
    variant;
    classInput;
    get hostClass() {
        return ["st-identityMenu", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: IdentityMenu, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: IdentityMenu, isStandalone: true, selector: "st-identity-menu", inputs: { user: "user", isAuthenticated: "isAuthenticated", open: "open", devicesHref: "devicesHref", settingsHref: "settingsHref", loginLabel: "loginLabel", devicesLabel: "devicesLabel", settingsLabel: "settingsLabel", logoutLabel: "logoutLabel", variant: "variant", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: IdentityMenu, decorators: [{
            type: Component,
            args: [{
                    selector: "st-identity-menu",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { user: [{
                type: NgInput
            }], isAuthenticated: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], devicesHref: [{
                type: NgInput
            }], settingsHref: [{
                type: NgInput
            }], loginLabel: [{
                type: NgInput
            }], devicesLabel: [{
                type: NgInput
            }], settingsLabel: [{
                type: NgInput
            }], logoutLabel: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=IdentityMenu.js.map