import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, CHART_MARGIN, chartDataList, clampFraction, extendValueDomain, fixedLogTicks, fixedTicks, forecastRuns, formatTick, isNumeric, linearRegression, logTicks, niceTicks, overlayDataListItems, overlayToneClass, scaleLinear, smallestPositive, validLinearDomain, validLogDomain, } from "./chartScale.js";
import { annotationDataListItems, polygonPoints, resolveAnnotations, } from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";
import * as i0 from "@angular/core";
export class LineChart {
    static stComponentName = "LineChart";
    componentName = "LineChart";
    data;
    width;
    height;
    tone;
    smooth;
    area;
    label;
    referenceLines;
    bands;
    goalLine;
    trend;
    annotations;
    dataLabels;
    domain;
    scale;
    invertAxis;
    showLegend;
    hoverKey;
    onHoverKeyChange;
    keyboardNav;
    onSelectKey;
    classInput;
    get hostClass() {
        return ["st-lineChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LineChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: LineChart, isStandalone: true, selector: "st-line-chart", inputs: { data: "data", width: "width", height: "height", tone: "tone", smooth: "smooth", area: "area", label: "label", referenceLines: "referenceLines", bands: "bands", goalLine: "goalLine", trend: "trend", annotations: "annotations", dataLabels: "dataLabels", domain: "domain", scale: "scale", invertAxis: "invertAxis", showLegend: "showLegend", hoverKey: "hoverKey", onHoverKeyChange: "onHoverKeyChange", keyboardNav: "keyboardNav", onSelectKey: "onSelectKey", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LineChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-line-chart",
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
            }], area: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], referenceLines: [{
                type: NgInput
            }], bands: [{
                type: NgInput
            }], goalLine: [{
                type: NgInput
            }], trend: [{
                type: NgInput
            }], annotations: [{
                type: NgInput
            }], dataLabels: [{
                type: NgInput
            }], domain: [{
                type: NgInput
            }], scale: [{
                type: NgInput
            }], invertAxis: [{
                type: NgInput
            }], showLegend: [{
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
//# sourceMappingURL=LineChart.js.map