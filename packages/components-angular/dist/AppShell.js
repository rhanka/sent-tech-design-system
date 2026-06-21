import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class AppShell {
    static stComponentName = "AppShell";
    componentName = "AppShell";
    variant = "workspace";
    mainId = "main";
    navigationLabel = "Workspace navigation";
    contextLabel = "Context panel";
    utilityLabel = "Utility panel";
    utilityMode = "reserve";
    utilitySide = "right";
    classInput;
    get hostClass() {
        return ["st-appShell", `st-appShell--${this.variant}`, this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AppShell, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: AppShell, isStandalone: true, selector: "st-app-shell", inputs: { variant: "variant", mainId: "mainId", navigationLabel: "navigationLabel", contextLabel: "contextLabel", utilityLabel: "utilityLabel", utilityMode: "utilityMode", utilitySide: "utilitySide", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [attr.data-st-app-shell-variant]="variant" [attr.data-utility-mode]="utilityMode" [attr.data-utility-side]="utilitySide" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AppShell, decorators: [{
            type: Component,
            args: [{
                    selector: "st-app-shell",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [attr.data-st-app-shell-variant]="variant" [attr.data-utility-mode]="utilityMode" [attr.data-utility-side]="utilitySide" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { variant: [{
                type: NgInput
            }], mainId: [{
                type: NgInput
            }], navigationLabel: [{
                type: NgInput
            }], contextLabel: [{
                type: NgInput
            }], utilityLabel: [{
                type: NgInput
            }], utilityMode: [{
                type: NgInput
            }], utilitySide: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=AppShell.js.map