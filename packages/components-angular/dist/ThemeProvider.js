import { Component, Input as NgInput } from "@angular/core";
import { compileTheme, sentTechTheme } from "@sentropic/design-system-themes";
import * as i0 from "@angular/core";
export class ThemeProvider {
    static stComponentName = "ThemeProvider";
    componentName = "ThemeProvider";
    theme = sentTechTheme;
    namespace = "st";
    /** Reference to the injected <style> element so it can be updated/removed. */
    styleEl = null;
    ngOnInit() {
        this.applyTheme();
    }
    ngOnChanges() {
        this.applyTheme();
    }
    ngOnDestroy() {
        if (this.styleEl && this.styleEl.parentNode) {
            this.styleEl.parentNode.removeChild(this.styleEl);
        }
        this.styleEl = null;
    }
    /** Compile the theme tokens to CSS and inject them into a <style> element. */
    applyTheme() {
        if (typeof document === "undefined")
            return;
        const theme = this.theme ?? sentTechTheme;
        const namespace = this.namespace ?? "st";
        const css = compileTheme(theme, {
            selector: `[data-st-theme="${theme.id}"]`,
            namespace,
        });
        if (!this.styleEl) {
            this.styleEl = document.createElement("style");
            document.head.appendChild(this.styleEl);
        }
        this.styleEl.setAttribute("data-st-theme-provider", theme.id);
        this.styleEl.textContent = css;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ThemeProvider, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ThemeProvider, isStandalone: true, selector: "st-theme-provider", inputs: { theme: "theme", namespace: "namespace" }, usesOnChanges: true, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [attr.data-st-theme]="theme.id">
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
    <div [attr.data-st-component]="componentName" [attr.data-st-theme]="theme.id">
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