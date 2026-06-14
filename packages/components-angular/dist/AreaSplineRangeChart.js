import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { buildSmoothPath, CHART_MARGIN, chartDataList, formatTick, isNumeric, niceTicks, scaleLinear, } from "./chartScale.js";
import * as i0 from "@angular/core";
export class AreaSplineRangeChart {
    static stComponentName = "AreaSplineRangeChart";
    componentName = "AreaSplineRangeChart";
    data;
    width;
    height;
    tone;
    label;
    classInput;
    get hostClass() {
        return ["st-areaSplineRangeChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AreaSplineRangeChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: AreaSplineRangeChart, isStandalone: true, selector: "st-area-spline-range-chart", inputs: { data: "data", width: "width", height: "height", tone: "tone", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AreaSplineRangeChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-area-spline-range-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=AreaSplineRangeChart.js.map