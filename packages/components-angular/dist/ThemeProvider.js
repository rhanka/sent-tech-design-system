import { Component, Input as NgInput } from "@angular/core";
import {} from "@sentropic/design-system-themes";
import * as i0 from "@angular/core";
export class ThemeProvider {
    static stComponentName = "ThemeProvider";
    componentName = "ThemeProvider";
    theme;
    namespace;
    get hostClass() {
        return ["st-themeProvider", undefined].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ThemeProvider, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ThemeProvider, isStandalone: true, selector: "st-theme-provider", inputs: { theme: "theme", namespace: "namespace" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ThemeProvider, decorators: [{
            type: Component,
            args: [{
                    selector: "st-theme-provider",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { theme: [{
                type: NgInput
            }], namespace: [{
                type: NgInput
            }] } });
//# sourceMappingURL=ThemeProvider.js.map