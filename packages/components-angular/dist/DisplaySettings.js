import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class DisplaySettings {
    static stComponentName = "DisplaySettings";
    componentName = "DisplaySettings";
    title;
    values;
    showFontScale;
    showContrast;
    showLineSpacing;
    showReducedMotion;
    classInput;
    get hostClass() {
        return ["st-displaySettings", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DisplaySettings, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: DisplaySettings, isStandalone: true, selector: "st-display-settings", inputs: { title: "title", values: "values", showFontScale: "showFontScale", showContrast: "showContrast", showLineSpacing: "showLineSpacing", showReducedMotion: "showReducedMotion", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DisplaySettings, decorators: [{
            type: Component,
            args: [{
                    selector: "st-display-settings",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], values: [{
                type: NgInput
            }], showFontScale: [{
                type: NgInput
            }], showContrast: [{
                type: NgInput
            }], showLineSpacing: [{
                type: NgInput
            }], showReducedMotion: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DisplaySettings.js.map