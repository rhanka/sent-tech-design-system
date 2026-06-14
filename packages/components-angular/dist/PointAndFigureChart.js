import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class PointAndFigureChart {
    static stComponentName = "PointAndFigureChart";
    componentName = "PointAndFigureChart";
    data;
    boxSize;
    reversal;
    label;
    width;
    height;
    size;
    classInput;
    get hostClass() {
        return ["st-pointAndFigureChart", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PointAndFigureChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: PointAndFigureChart, isStandalone: true, selector: "st-point-and-figure-chart", inputs: { data: "data", boxSize: "boxSize", reversal: "reversal", label: "label", width: "width", height: "height", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PointAndFigureChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-point-and-figure-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], boxSize: [{
                type: NgInput
            }], reversal: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=PointAndFigureChart.js.map