import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export function spanBasis(span) {
    if (span == null)
        return undefined;
    if (span === "auto")
        return "auto";
    const clamped = Math.max(1, Math.min(12, Math.round(span)));
    const ratio = clamped / 12;
    return `calc(${ratio * 100}% - var(--st-row-gutter, 0px) * ${(12 - clamped) / 12})`;
}
export function offsetMargin(offset) {
    if (!offset)
        return undefined;
    const clamped = Math.max(0, Math.min(11, Math.round(offset)));
    if (clamped === 0)
        return undefined;
    const ratio = clamped / 12;
    return `calc(${ratio * 100}% + var(--st-row-gutter, 0px) * ${ratio})`;
}
export class Col {
    static stComponentName = "Col";
    componentName = "Col";
    span;
    offset;
    sm;
    md;
    lg;
    as;
    classInput;
    get isAuto() {
        return this.span === "auto";
    }
    get hostClass() {
        return classNames("st-col", this.isAuto && "st-col--auto", this.sm != null && "st-col--has-sm", this.md != null && "st-col--has-md", this.lg != null && "st-col--has-lg", this.classInput);
    }
    // Parité stricte React/Vue : la colonne `auto` grandit (flex-grow:1) au lieu de
    // se figer à la largeur du contenu ; les autres colonnes sont plafonnées à leur
    // basis et les surcharges responsives passent par les variables `--st-col-*`.
    spanBasisFor(span) {
        return spanBasis(span) ?? null;
    }
    get inlineStyles() {
        const basis = spanBasis(this.span);
        return {
            flexBasis: basis,
            maxInlineSize: this.isAuto ? undefined : basis,
            flexGrow: this.isAuto ? '1' : '0',
            marginInlineStart: offsetMargin(this.offset),
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Col, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Col, isStandalone: true, selector: "st-col", inputs: { span: "span", offset: "offset", sm: "sm", md: "md", lg: "lg", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [style.--st-col-sm]="spanBasisFor(sm)"
      [style.--st-col-md]="spanBasisFor(md)"
      [style.--st-col-lg]="spanBasisFor(lg)"
      [ngStyle]="inlineStyles"
    >
      <ng-content></ng-content>
    </div>
  `, isInline: true, styles: [":host { display: contents; }"], dependencies: [{ kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Col, decorators: [{
            type: Component,
            args: [{ selector: "st-col", standalone: true, imports: [NgStyle], template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [style.--st-col-sm]="spanBasisFor(sm)"
      [style.--st-col-md]="spanBasisFor(md)"
      [style.--st-col-lg]="spanBasisFor(lg)"
      [ngStyle]="inlineStyles"
    >
      <ng-content></ng-content>
    </div>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { span: [{
                type: NgInput
            }], offset: [{
                type: NgInput
            }], sm: [{
                type: NgInput
            }], md: [{
                type: NgInput
            }], lg: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Col.js.map