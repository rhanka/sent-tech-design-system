import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { spacingToken } from "./Flex.js";
import * as i0 from "@angular/core";
export function gridTemplateColumns(columns, minItemWidth) {
    if (minItemWidth != null && minItemWidth !== "") {
        return `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`;
    }
    if (columns != null) {
        const clamped = Math.max(1, Math.round(columns));
        return `repeat(${clamped}, minmax(0, 1fr))`;
    }
    return undefined;
}
export class Grid {
    static stComponentName = "Grid";
    componentName = "Grid";
    columns;
    minItemWidth;
    gap;
    as;
    classInput;
    get hostClass() {
        return ["st-grid", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Grid, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Grid, isStandalone: true, selector: "st-grid", inputs: { columns: "columns", minItemWidth: "minItemWidth", gap: "gap", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Grid, decorators: [{
            type: Component,
            args: [{
                    selector: "st-grid",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { columns: [{
                type: NgInput
            }], minItemWidth: [{
                type: NgInput
            }], gap: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Grid.js.map