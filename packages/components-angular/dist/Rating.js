import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Rating {
    static stComponentName = "Rating";
    componentName = "Rating";
    value;
    max;
    onChange;
    readonly;
    allowHalf;
    size;
    name;
    label;
    classInput;
    get hostClass() {
        return ["st-rating", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Rating, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Rating, isStandalone: true, selector: "st-rating", inputs: { value: "value", max: "max", onChange: "onChange", readonly: "readonly", allowHalf: "allowHalf", size: "size", name: "name", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Rating, decorators: [{
            type: Component,
            args: [{
                    selector: "st-rating",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], readonly: [{
                type: NgInput
            }], allowHalf: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], name: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Rating.js.map