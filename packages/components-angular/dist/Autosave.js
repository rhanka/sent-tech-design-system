import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Autosave {
    static stComponentName = "Autosave";
    componentName = "Autosave";
    status;
    lastSaved;
    onRetry;
    labels;
    retryLabel;
    locale;
    classInput;
    get hostClass() {
        return ["st-autosave", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Autosave, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Autosave, isStandalone: true, selector: "st-autosave", inputs: { status: "status", lastSaved: "lastSaved", onRetry: "onRetry", labels: "labels", retryLabel: "retryLabel", locale: "locale", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Autosave, decorators: [{
            type: Component,
            args: [{
                    selector: "st-autosave",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { status: [{
                type: NgInput
            }], lastSaved: [{
                type: NgInput
            }], onRetry: [{
                type: NgInput
            }], labels: [{
                type: NgInput
            }], retryLabel: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Autosave.js.map