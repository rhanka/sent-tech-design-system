import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, chartDataList, clampFraction, extendValueDomain, fixedLogTicks, fixedTicks, formatTick, logTicks, niceTicks, overlayDataListItems, overlayToneClass, smallestPositive, validLinearDomain, validLogDomain, } from "./chartScale.js";
import { annotationDataListItems, polygonPoints, resolveAnnotations, } from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import { resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";
import * as i0 from "@angular/core";
export class BarChart {
    static stComponentName = "BarChart";
    componentName = "BarChart";
    data;
    width;
    height;
    orientation;
    label;
    domain;
    selectedKeys;
    onSelect;
    referenceLines;
    bands;
    goalLine;
    annotations;
    dataLabels;
    scale;
    invertAxis;
    showLegend;
    hoverKey;
    onHoverKeyChange;
    keyboardNav;
    onSelectKey;
    classInput;
    get hostClass() {
        return ["st-barChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BarChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: BarChart, isStandalone: true, selector: "st-bar-chart", inputs: { data: "data", width: "width", height: "height", orientation: "orientation", label: "label", domain: "domain", selectedKeys: "selectedKeys", onSelect: "onSelect", referenceLines: "referenceLines", bands: "bands", goalLine: "goalLine", annotations: "annotations", dataLabels: "dataLabels", scale: "scale", invertAxis: "invertAxis", showLegend: "showLegend", hoverKey: "hoverKey", onHoverKeyChange: "onHoverKeyChange", keyboardNav: "keyboardNav", onSelectKey: "onSelectKey", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BarChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-bar-chart",
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
            }], selectedKeys: [{
                type: NgInput
            }], onSelect: [{
                type: NgInput
            }], referenceLines: [{
                type: NgInput
            }], bands: [{
                type: NgInput
            }], goalLine: [{
                type: NgInput
            }], annotations: [{
                type: NgInput
            }], dataLabels: [{
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
//# sourceMappingURL=BarChart.js.map