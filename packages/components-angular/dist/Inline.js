import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";
import { classNames } from "./classNames.js";
import { spacingToken, alignValue, justifyValue } from "./Flex.js";
import * as i0 from "@angular/core";
export class Inline {
    static stComponentName = "Inline";
    componentName = "Inline";
    gap;
    align;
    justify;
    wrap;
    as;
    classInput;
    get hostClass() {
        return classNames("st-flex", "st-inline", this.classInput);
    }
    get inlineStyles() {
        return {
            display: "flex",
            flexDirection: "row",
            flexWrap: this.wrap !== false ? "wrap" : "nowrap",
            alignItems: alignValue(this.align),
            justifyContent: justifyValue(this.justify),
            gap: spacingToken(this.gap),
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Inline, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Inline, isStandalone: true, selector: "st-inline", inputs: { gap: "gap", align: "align", justify: "justify", wrap: "wrap", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="inlineStyles">
      <ng-content></ng-content>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Inline, decorators: [{
            type: Component,
            args: [{
                    selector: "st-inline",
                    standalone: true,
                    imports: [NgStyle],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="inlineStyles">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { gap: [{
                type: NgInput
            }], align: [{
                type: NgInput
            }], justify: [{
                type: NgInput
            }], wrap: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Inline.js.map