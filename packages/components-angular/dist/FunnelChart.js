import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList, labelColorForTone } from "./chartScale.js";
import * as i0 from "@angular/core";
export class FunnelChart {
    static stComponentName = "FunnelChart";
    componentName = "FunnelChart";
    data;
    orientation;
    showPercentages;
    percentMode;
    legend;
    label;
    width;
    height;
    classInput;
    get hostClass() {
        return ["st-funnelChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FunnelChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: FunnelChart, isStandalone: true, selector: "st-funnel-chart", inputs: { data: "data", orientation: "orientation", showPercentages: "showPercentages", percentMode: "percentMode", legend: "legend", label: "label", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FunnelChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-funnel-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], showPercentages: [{
                type: NgInput
            }], percentMode: [{
                type: NgInput
            }], legend: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=FunnelChart.js.map