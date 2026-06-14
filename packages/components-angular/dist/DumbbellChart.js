import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { GraphLegend } from "./GraphLegend.js";
import * as i0 from "@angular/core";
export class DumbbellChart {
    static stComponentName = "DumbbellChart";
    componentName = "DumbbellChart";
    data;
    width;
    height;
    lowTone;
    highTone;
    lowLabel;
    highLabel;
    label;
    classInput;
    get hostClass() {
        return ["st-dumbbellChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DumbbellChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: DumbbellChart, isStandalone: true, selector: "st-dumbbell-chart", inputs: { data: "data", width: "width", height: "height", lowTone: "lowTone", highTone: "highTone", lowLabel: "lowLabel", highLabel: "highLabel", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DumbbellChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-dumbbell-chart",
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
            }], lowTone: [{
                type: NgInput
            }], highTone: [{
                type: NgInput
            }], lowLabel: [{
                type: NgInput
            }], highLabel: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DumbbellChart.js.map