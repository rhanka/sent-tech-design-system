import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { annotationDataListItems, polygonPoints, resolveAnnotations, } from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";
import * as i0 from "@angular/core";
export class ComboChart {
    static stComponentName = "ComboChart";
    componentName = "ComboChart";
    categories;
    bars;
    lines;
    leftAxisLabel;
    rightAxisLabel;
    legend;
    hiddenSeries;
    onToggleSeries;
    annotations;
    dataLabels;
    hoverKey;
    onHoverKeyChange;
    keyboardNav;
    onSelectKey;
    width;
    height;
    label;
    classInput;
    get hostClass() {
        return ["st-comboChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ComboChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ComboChart, isStandalone: true, selector: "st-combo-chart", inputs: { categories: "categories", bars: "bars", lines: "lines", leftAxisLabel: "leftAxisLabel", rightAxisLabel: "rightAxisLabel", legend: "legend", hiddenSeries: "hiddenSeries", onToggleSeries: "onToggleSeries", annotations: "annotations", dataLabels: "dataLabels", hoverKey: "hoverKey", onHoverKeyChange: "onHoverKeyChange", keyboardNav: "keyboardNav", onSelectKey: "onSelectKey", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ComboChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-combo-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { categories: [{
                type: NgInput
            }], bars: [{
                type: NgInput
            }], lines: [{
                type: NgInput
            }], leftAxisLabel: [{
                type: NgInput
            }], rightAxisLabel: [{
                type: NgInput
            }], legend: [{
                type: NgInput
            }], hiddenSeries: [{
                type: NgInput
            }], onToggleSeries: [{
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
//# sourceMappingURL=ComboChart.js.map