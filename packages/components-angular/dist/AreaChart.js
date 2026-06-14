import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, CHART_MARGIN, chartDataList, formatTick, isNumeric, niceTicks, scaleLinear, } from "./chartScale.js";
import { annotationDataListItems, polygonPoints, resolveAnnotations, } from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";
import * as i0 from "@angular/core";
export class AreaChart {
    static stComponentName = "AreaChart";
    componentName = "AreaChart";
    data;
    width;
    height;
    tone;
    smooth;
    label;
    annotations;
    dataLabels;
    hoverKey;
    onHoverKeyChange;
    keyboardNav;
    onSelectKey;
    classInput;
    get hostClass() {
        return ["st-areaChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AreaChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: AreaChart, isStandalone: true, selector: "st-area-chart", inputs: { data: "data", width: "width", height: "height", tone: "tone", smooth: "smooth", label: "label", annotations: "annotations", dataLabels: "dataLabels", hoverKey: "hoverKey", onHoverKeyChange: "onHoverKeyChange", keyboardNav: "keyboardNav", onSelectKey: "onSelectKey", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AreaChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-area-chart",
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
            }], smooth: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], annotations: [{
                type: NgInput
            }], dataLabels: [{
                type: NgInput
            }], hoverKey: [{
                type: NgInput
            }], onHoverKeyChange: [{
                type: NgInput
            }], keyboardNav: [{
                type: NgInput
            }], onSelectKey: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=AreaChart.js.map