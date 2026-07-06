import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";
import { classNames } from "./classNames.js";
import { spacingToken, alignValue, justifyValue } from "./Flex.js";
import * as i0 from "@angular/core";
export class Row {
    static stComponentName = "Row";
    componentName = "Row";
    gutter;
    align;
    justify;
    wrap;
    as;
    classInput;
    get hostClass() {
        return ["st-row", this.classInput].filter(Boolean).join(" ");
    }
    // Gouttière exposée en variable CSS pour que les `Col` enfants soustraient le
    // gutter de leur flex-basis (parité Vue : `calc(% - var(--st-row-gutter))`).
    get gutterToken() {
        return spacingToken(this.gutter) ?? "0";
    }
    get inlineStyles() {
        return {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: this.wrap !== false ? 'wrap' : 'nowrap',
            gap: this.gutterToken,
            alignItems: this.align ? alignValue(this.align) : undefined,
            justifyContent: this.justify ? justifyValue(this.justify) : undefined,
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Row, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Row, isStandalone: true, selector: "st-row", inputs: { gutter: "gutter", align: "align", justify: "justify", wrap: "wrap", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [style.--st-row-gutter]="gutterToken"
      [ngStyle]="inlineStyles"
    >
      <ng-content></ng-content>
    </div>
  `, isInline: true, styles: [":host { display: contents; }"], dependencies: [{ kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Row, decorators: [{
            type: Component,
            args: [{ selector: "st-row", standalone: true, imports: [NgStyle], template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [style.--st-row-gutter]="gutterToken"
      [ngStyle]="inlineStyles"
    >
      <ng-content></ng-content>
    </div>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { gutter: [{
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
//# sourceMappingURL=Row.js.map