import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { nodeShapePath, } from "./ForceGraph.js";
import * as i0 from "@angular/core";
export class GraphLegend {
    static stComponentName = "GraphLegend";
    componentName = "GraphLegend";
    entries;
    title;
    classInput;
    get hostClass() {
        return ["st-graphLegend", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GraphLegend, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: GraphLegend, isStandalone: true, selector: "st-graph-legend", inputs: { entries: "entries", title: "title", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GraphLegend, decorators: [{
            type: Component,
            args: [{
                    selector: "st-graph-legend",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { entries: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=GraphLegend.js.map