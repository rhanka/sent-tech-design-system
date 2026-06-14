import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, buildLinearPath, buildSmoothPath, chartDataList, formatTick, niceTicks, scaleLinear, } from "./chartScale.js";
import * as i0 from "@angular/core";
export class BellCurveChart {
    static stComponentName = "BellCurveChart";
    componentName = "BellCurveChart";
    data;
    width;
    height;
    tone;
    smooth;
    intervals;
    label;
    classInput;
    get hostClass() {
        return ["st-bellCurveChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BellCurveChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: BellCurveChart, isStandalone: true, selector: "st-bell-curve-chart", inputs: { data: "data", width: "width", height: "height", tone: "tone", smooth: "smooth", intervals: "intervals", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BellCurveChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-bell-curve-chart",
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
            }], smooth: [{
                type: NgInput
            }], intervals: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=BellCurveChart.js.map