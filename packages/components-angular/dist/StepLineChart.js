import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, chartDataList, formatTick, isNumeric, niceTicks, scaleLinear, } from "./chartScale.js";
import * as i0 from "@angular/core";
export class StepLineChart {
    static stComponentName = "StepLineChart";
    componentName = "StepLineChart";
    data;
    width;
    height;
    tone;
    label;
    classInput;
    get hostClass() {
        return ["st-stepLineChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StepLineChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: StepLineChart, isStandalone: true, selector: "st-step-line-chart", inputs: { data: "data", width: "width", height: "height", tone: "tone", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StepLineChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-step-line-chart",
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
//# sourceMappingURL=StepLineChart.js.map