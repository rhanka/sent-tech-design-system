import { NgTemplateOutlet } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Overline {
    static stComponentName = "Overline";
    componentName = "Overline";
    as;
    classInput;
    get resolvedTag() {
        return this.as ?? "span";
    }
    get hostClass() {
        return classNames("st-overline", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Overline, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Overline, isStandalone: true, selector: "st-overline", inputs: { as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ng-template #content><ng-content></ng-content></ng-template>
    @switch (resolvedTag) {
      @case ("div") {
        <div [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></div>
      }
      @case ("h2") {
        <h2 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h2>
      }
      @case ("h3") {
        <h3 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h3>
      }
      @default {
        <span [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></span>
      }
    }
  `, isInline: true, styles: [":host { display: contents; }"], dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Overline, decorators: [{
            type: Component,
            args: [{ selector: "st-overline", standalone: true, imports: [NgTemplateOutlet], template: `
    <ng-template #content><ng-content></ng-content></ng-template>
    @switch (resolvedTag) {
      @case ("div") {
        <div [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></div>
      }
      @case ("h2") {
        <h2 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h2>
      }
      @case ("h3") {
        <h3 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h3>
      }
      @default {
        <span [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></span>
      }
    }
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Overline.js.map