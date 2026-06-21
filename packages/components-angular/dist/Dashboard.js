import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class Dashboard {
    static stComponentName = "Dashboard";
    componentName = "Dashboard";
    appTitle;
    pageTitle = "";
    navItems = [];
    kpis = [];
    classInput;
    get hostClass() {
        return ["st-dash", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Dashboard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Dashboard, isStandalone: true, selector: "st-dashboard", inputs: { appTitle: "appTitle", pageTitle: "pageTitle", navItems: "navItems", kpis: "kpis", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Dashboard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-dashboard",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { appTitle: [{
                type: NgInput
            }], pageTitle: [{
                type: NgInput
            }], navItems: [{
                type: NgInput
            }], kpis: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Dashboard.js.map