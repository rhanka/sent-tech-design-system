import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";
import { GraphLegend } from "./GraphLegend.js";
import * as i0 from "@angular/core";
export class DependencyWheelChart {
    static stComponentName = "DependencyWheelChart";
    componentName = "DependencyWheelChart";
    data;
    labels;
    width;
    height;
    label;
    classInput;
    get hostClass() {
        return ["st-dependencyWheelChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DependencyWheelChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: DependencyWheelChart, isStandalone: true, selector: "st-dependency-wheel-chart", inputs: { data: "data", labels: "labels", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DependencyWheelChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-dependency-wheel-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], labels: [{
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
//# sourceMappingURL=DependencyWheelChart.js.map