import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class SlideIndicator {
    static stComponentName = "SlideIndicator";
    componentName = "SlideIndicator";
    count;
    current;
    onChange;
    size;
    variant;
    label;
    classInput;
    get hostClass() {
        return ["st-slideIndicator", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SlideIndicator, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: SlideIndicator, isStandalone: true, selector: "st-slide-indicator", inputs: { count: "count", current: "current", onChange: "onChange", size: "size", variant: "variant", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SlideIndicator, decorators: [{
            type: Component,
            args: [{
                    selector: "st-slide-indicator",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { count: [{
                type: NgInput
            }], current: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SlideIndicator.js.map