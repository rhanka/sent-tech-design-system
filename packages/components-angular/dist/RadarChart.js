import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import * as i0 from "@angular/core";
export class RadarChart {
    static stComponentName = "RadarChart";
    componentName = "RadarChart";
    axes;
    series;
    maxValue;
    levels;
    width;
    height;
    legend;
    label;
    classInput;
    get hostClass() {
        return ["st-radarChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RadarChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: RadarChart, isStandalone: true, selector: "st-radar-chart", inputs: { axes: "axes", series: "series", maxValue: "maxValue", levels: "levels", width: "width", height: "height", legend: "legend", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RadarChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-radar-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { axes: [{
                type: NgInput
            }], series: [{
                type: NgInput
            }], maxValue: [{
                type: NgInput
            }], levels: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], legend: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=RadarChart.js.map