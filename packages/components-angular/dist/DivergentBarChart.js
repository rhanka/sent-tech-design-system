import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
export class DivergentBarChart {
    static stComponentName = "DivergentBarChart";
    componentName = "DivergentBarChart";
    data;
    width;
    height;
    domain;
    format;
    showLegend;
    label;
    classInput;
    get hostClass() {
        return ["st-divergentBarChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DivergentBarChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: DivergentBarChart, isStandalone: true, selector: "st-divergent-bar-chart", inputs: { data: "data", width: "width", height: "height", domain: "domain", format: "format", showLegend: "showLegend", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DivergentBarChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-divergent-bar-chart",
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
            }], domain: [{
                type: NgInput
            }], format: [{
                type: NgInput
            }], showLegend: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DivergentBarChart.js.map