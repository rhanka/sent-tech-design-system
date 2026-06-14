import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export class StackedBarChart {
    static stComponentName = "StackedBarChart";
    componentName = "StackedBarChart";
    data;
    width;
    height;
    label;
    showLegend;
    dataLabels;
    hiddenSeries;
    onToggleSeries;
    classInput;
    get hostClass() {
        return ["st-stackedBarChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StackedBarChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: StackedBarChart, isStandalone: true, selector: "st-stacked-bar-chart", inputs: { data: "data", width: "width", height: "height", label: "label", showLegend: "showLegend", dataLabels: "dataLabels", hiddenSeries: "hiddenSeries", onToggleSeries: "onToggleSeries", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StackedBarChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-stacked-bar-chart",
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
            }], label: [{
                type: NgInput
            }], showLegend: [{
                type: NgInput
            }], dataLabels: [{
                type: NgInput
            }], hiddenSeries: [{
                type: NgInput
            }], onToggleSeries: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StackedBarChart.js.map