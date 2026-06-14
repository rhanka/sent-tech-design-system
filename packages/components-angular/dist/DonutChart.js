import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export class DonutChart {
    static stComponentName = "DonutChart";
    componentName = "DonutChart";
    data;
    size;
    thickness;
    centerLabel;
    dataLabels;
    label;
    classInput;
    get hostClass() {
        return ["st-donutChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DonutChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: DonutChart, isStandalone: true, selector: "st-donut-chart", inputs: { data: "data", size: "size", thickness: "thickness", centerLabel: "centerLabel", dataLabels: "dataLabels", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DonutChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-donut-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], thickness: [{
                type: NgInput
            }], centerLabel: [{
                type: NgInput
            }], dataLabels: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DonutChart.js.map