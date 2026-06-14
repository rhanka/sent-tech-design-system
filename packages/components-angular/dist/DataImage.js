import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class DataImage {
    static stComponentName = "DataImage";
    componentName = "DataImage";
    src;
    alt;
    width;
    height;
    fit;
    radius;
    loading;
    decoding;
    classInput;
    get hostClass() {
        return ["st-dataImage", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DataImage, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: DataImage, isStandalone: true, selector: "st-data-image", inputs: { src: "src", alt: "alt", width: "width", height: "height", fit: "fit", radius: "radius", loading: "loading", decoding: "decoding", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DataImage, decorators: [{
            type: Component,
            args: [{
                    selector: "st-data-image",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { src: [{
                type: NgInput
            }], alt: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], fit: [{
                type: NgInput
            }], radius: [{
                type: NgInput
            }], loading: [{
                type: NgInput
            }], decoding: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DataImage.js.map