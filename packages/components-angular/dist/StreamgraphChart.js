import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, chartDataList, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
export class StreamgraphChart {
    static stComponentName = "StreamgraphChart";
    componentName = "StreamgraphChart";
    data;
    width;
    height;
    label;
    smooth;
    showLegend;
    classInput;
    get hostClass() {
        return ["st-streamgraphChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamgraphChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: StreamgraphChart, isStandalone: true, selector: "st-streamgraph-chart", inputs: { data: "data", width: "width", height: "height", label: "label", smooth: "smooth", showLegend: "showLegend", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamgraphChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-streamgraph-chart",
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
            }], smooth: [{
                type: NgInput
            }], showLegend: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StreamgraphChart.js.map