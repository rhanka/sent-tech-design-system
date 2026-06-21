import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const SPACING_FALLBACK = {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    11: "2.75rem",
    12: "3rem",
};
export function spacingToken(step) {
    if (step == null)
        return undefined;
    const clamped = Math.max(0, Math.min(12, Math.round(step)));
    if (clamped === 0)
        return "0";
    return `var(--st-spacing-${clamped}, ${SPACING_FALLBACK[clamped]})`;
}
const ALIGN = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    baseline: "baseline",
};
const JUSTIFY = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
};
export function alignValue(align) {
    return align ? ALIGN[align] : undefined;
}
export function justifyValue(justify) {
    return justify ? JUSTIFY[justify] : undefined;
}
export class Flex {
    static stComponentName = "Flex";
    componentName = "Flex";
    direction;
    gap;
    align;
    justify;
    wrap;
    inline;
    as;
    classInput;
    get hostClass() {
        return classNames("st-flex", this.classInput);
    }
    get inlineStyles() {
        return {
            display: this.inline ? "inline-flex" : "flex",
            flexDirection: this.direction,
            flexWrap: this.wrap ? "wrap" : "nowrap",
            alignItems: alignValue(this.align),
            justifyContent: justifyValue(this.justify),
            gap: spacingToken(this.gap),
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Flex, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Flex, isStandalone: true, selector: "st-flex", inputs: { direction: "direction", gap: "gap", align: "align", justify: "justify", wrap: "wrap", inline: "inline", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="inlineStyles">
      <ng-content></ng-content>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Flex, decorators: [{
            type: Component,
            args: [{
                    selector: "st-flex",
                    standalone: true,
                    imports: [NgStyle],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="inlineStyles">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { direction: [{
                type: NgInput
            }], gap: [{
                type: NgInput
            }], align: [{
                type: NgInput
            }], justify: [{
                type: NgInput
            }], wrap: [{
                type: NgInput
            }], inline: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Flex.js.map