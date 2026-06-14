import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Tag {
    static stComponentName = "Tag";
    componentName = "Tag";
    tone;
    size;
    disabled;
    dismissible;
    dismissLabel;
    onDismiss;
    classInput;
    get hostClass() {
        return ["st-tag", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tag, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Tag, isStandalone: true, selector: "st-tag", inputs: { tone: "tone", size: "size", disabled: "disabled", dismissible: "dismissible", dismissLabel: "dismissLabel", onDismiss: "onDismiss", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tag, decorators: [{
            type: Component,
            args: [{
                    selector: "st-tag",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { tone: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], dismissible: [{
                type: NgInput
            }], dismissLabel: [{
                type: NgInput
            }], onDismiss: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Tag.js.map