import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ColorScaleBar {
    static stComponentName = "ColorScaleBar";
    componentName = "ColorScaleBar";
    colors;
    orientation;
    length;
    thickness;
    min;
    max;
    label;
    classInput;
    get hostClass() {
        return classNames("st-colorScaleBar", `st-colorScaleBar--${this.orientation ?? "horizontal"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColorScaleBar, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ColorScaleBar, isStandalone: true, selector: "st-color-scale-bar", inputs: { colors: "colors", orientation: "orientation", length: "length", thickness: "thickness", min: "min", max: "max", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColorScaleBar, decorators: [{
            type: Component,
            args: [{
                    selector: "st-color-scale-bar",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { colors: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], length: [{
                type: NgInput
            }], thickness: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ColorScaleBar.js.map