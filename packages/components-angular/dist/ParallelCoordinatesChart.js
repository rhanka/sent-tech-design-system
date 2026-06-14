import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import * as i0 from "@angular/core";
export class ParallelCoordinatesChart {
    static stComponentName = "ParallelCoordinatesChart";
    componentName = "ParallelCoordinatesChart";
    axes;
    data;
    label;
    tones;
    width;
    height;
    classInput;
    get hostClass() {
        return ["st-parallelCoordinatesChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ParallelCoordinatesChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ParallelCoordinatesChart, isStandalone: true, selector: "st-parallel-coordinates-chart", inputs: { axes: "axes", data: "data", label: "label", tones: "tones", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ParallelCoordinatesChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-parallel-coordinates-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { axes: [{
                type: NgInput
            }], data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], tones: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ParallelCoordinatesChart.js.map