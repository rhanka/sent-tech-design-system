import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList, labelColorForTone } from "./chartScale.js";
import * as i0 from "@angular/core";
export class TreemapChart {
    static stComponentName = "TreemapChart";
    componentName = "TreemapChart";
    data;
    tiling;
    showLabels;
    legend;
    width;
    height;
    label;
    classInput;
    get hostClass() {
        return ["st-treemapChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreemapChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: TreemapChart, isStandalone: true, selector: "st-treemap-chart", inputs: { data: "data", tiling: "tiling", showLabels: "showLabels", legend: "legend", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreemapChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-treemap-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], tiling: [{
                type: NgInput
            }], showLabels: [{
                type: NgInput
            }], legend: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=TreemapChart.js.map