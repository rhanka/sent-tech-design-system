import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks } from "./chartScale.js";
import * as i0 from "@angular/core";
export class ColumnRangeChart {
    static stComponentName = "ColumnRangeChart";
    componentName = "ColumnRangeChart";
    data;
    width;
    height;
    orientation;
    label;
    domain;
    classInput;
    get hostClass() {
        return ["st-columnRangeChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColumnRangeChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ColumnRangeChart, isStandalone: true, selector: "st-column-range-chart", inputs: { data: "data", width: "width", height: "height", orientation: "orientation", label: "label", domain: "domain", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColumnRangeChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-column-range-chart",
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
            }], orientation: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], domain: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ColumnRangeChart.js.map