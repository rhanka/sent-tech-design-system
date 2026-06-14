import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class BackToTop {
    static stComponentName = "BackToTop";
    componentName = "BackToTop";
    label;
    disabled;
    targetId;
    threshold;
    autoHide;
    smooth;
    classInput;
    get hostClass() {
        return ["st-backToTop", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BackToTop, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: BackToTop, isStandalone: true, selector: "st-back-to-top", inputs: { label: "label", disabled: "disabled", targetId: "targetId", threshold: "threshold", autoHide: "autoHide", smooth: "smooth", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BackToTop, decorators: [{
            type: Component,
            args: [{
                    selector: "st-back-to-top",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], targetId: [{
                type: NgInput
            }], threshold: [{
                type: NgInput
            }], autoHide: [{
                type: NgInput
            }], smooth: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=BackToTop.js.map