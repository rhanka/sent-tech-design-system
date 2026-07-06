import { NgTemplateOutlet } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
/** Balise HTML par défaut pour chaque variante. */
const VARIANT_TAG = {
    display: "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    body: "p",
    "body-sm": "p",
    caption: "span",
    overline: "span",
};
export class Typography {
    static stComponentName = "Typography";
    componentName = "Typography";
    variant;
    as;
    weight;
    tone;
    align;
    truncate;
    classInput;
    get tag() {
        return this.as ?? VARIANT_TAG[this.variant ?? "body"];
    }
    get hostClass() {
        return classNames("st-typography", `st-typography--${this.variant ?? "body"}`, this.weight && `st-typography--weight-${this.weight}`, this.tone && `st-typography--tone-${this.tone}`, this.align && `st-typography--align-${this.align}`, this.truncate && "st-typography--truncate", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Typography, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Typography, isStandalone: true, selector: "st-typography", inputs: { variant: "variant", as: "as", weight: "weight", tone: "tone", align: "align", truncate: "truncate", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ng-template #content><ng-content></ng-content></ng-template>
    @switch (tag) {
      @case ("h1") {
        <h1 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h1>
      }
      @case ("h2") {
        <h2 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h2>
      }
      @case ("h3") {
        <h3 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h3>
      }
      @case ("h4") {
        <h4 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h4>
      }
      @case ("h5") {
        <h5 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h5>
      }
      @case ("h6") {
        <h6 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h6>
      }
      @case ("p") {
        <p [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></p>
      }
      @case ("span") {
        <span [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></span>
      }
      @default {
        <p [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></p>
      }
    }
  `, isInline: true, styles: [":host { display: contents; }"], dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Typography, decorators: [{
            type: Component,
            args: [{ selector: "st-typography", standalone: true, imports: [NgTemplateOutlet], template: `
    <ng-template #content><ng-content></ng-content></ng-template>
    @switch (tag) {
      @case ("h1") {
        <h1 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h1>
      }
      @case ("h2") {
        <h2 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h2>
      }
      @case ("h3") {
        <h3 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h3>
      }
      @case ("h4") {
        <h4 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h4>
      }
      @case ("h5") {
        <h5 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h5>
      }
      @case ("h6") {
        <h6 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h6>
      }
      @case ("p") {
        <p [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></p>
      }
      @case ("span") {
        <span [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></span>
      }
      @default {
        <p [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></p>
      }
    }
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { variant: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], weight: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], align: [{
                type: NgInput
            }], truncate: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Typography.js.map