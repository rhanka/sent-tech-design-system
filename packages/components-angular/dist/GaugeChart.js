import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import * as i0 from "@angular/core";
export class GaugeChart {
    static stComponentName = "GaugeChart";
    componentName = "GaugeChart";
    value;
    min;
    max;
    thresholds;
    label;
    format;
    unit;
    size;
    thickness;
    startAngle;
    endAngle;
    classInput;
    get hostClass() {
        return ["st-gaugeChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GaugeChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: GaugeChart, isStandalone: true, selector: "st-gauge-chart", inputs: { value: "value", min: "min", max: "max", thresholds: "thresholds", label: "label", format: "format", unit: "unit", size: "size", thickness: "thickness", startAngle: "startAngle", endAngle: "endAngle", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GaugeChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-gauge-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], thresholds: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], format: [{
                type: NgInput
            }], unit: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], thickness: [{
                type: NgInput
            }], startAngle: [{
                type: NgInput
            }], endAngle: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=GaugeChart.js.map