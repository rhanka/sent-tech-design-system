import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ColorSwatch {
    static stComponentName = "ColorSwatch";
    componentName = "ColorSwatch";
    color;
    size;
    shape;
    label;
    classInput;
    get hostClass() {
        return classNames("st-colorSwatch", `st-colorSwatch--${this.shape ?? "square"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColorSwatch, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ColorSwatch, isStandalone: true, selector: "st-color-swatch", inputs: { color: "color", size: "size", shape: "shape", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColorSwatch, decorators: [{
            type: Component,
            args: [{
                    selector: "st-color-swatch",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { color: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], shape: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ColorSwatch.js.map