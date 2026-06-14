import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import * as i0 from "@angular/core";
export class GeoMap {
    static stComponentName = "GeoMap";
    componentName = "GeoMap";
    layers;
    width;
    height;
    projection;
    bounds;
    label;
    classInput;
    get hostClass() {
        return ["st-geoMap", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GeoMap, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: GeoMap, isStandalone: true, selector: "st-geo-map", inputs: { layers: "layers", width: "width", height: "height", projection: "projection", bounds: "bounds", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GeoMap, decorators: [{
            type: Component,
            args: [{
                    selector: "st-geo-map",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { layers: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], projection: [{
                type: NgInput
            }], bounds: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=GeoMap.js.map