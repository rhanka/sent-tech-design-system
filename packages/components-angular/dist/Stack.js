import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";
import { classNames } from "./classNames.js";
import { spacingToken, alignValue, justifyValue } from "./Flex.js";
import * as i0 from "@angular/core";
export class Stack {
    static stComponentName = "Stack";
    componentName = "Stack";
    gap;
    align;
    justify;
    as;
    classInput;
    get hostClass() {
        // Svelte renders Stack via <Flex>, whose root element carries `st-flex`
        // before the consumer class — reproduce the same rendered class chain so
        // `.st-flex` rules (box-sizing, min-width) apply.
        return classNames("st-flex", "st-stack", this.classInput);
    }
    get inlineStyles() {
        return {
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            alignItems: alignValue(this.align),
            justifyContent: justifyValue(this.justify),
            gap: spacingToken(this.gap),
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Stack, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Stack, isStandalone: true, selector: "st-stack", inputs: { gap: "gap", align: "align", justify: "justify", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="inlineStyles">
      <ng-content></ng-content>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Stack, decorators: [{
            type: Component,
            args: [{
                    selector: "st-stack",
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
            }], as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Stack.js.map