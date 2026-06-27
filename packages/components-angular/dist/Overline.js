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
    @switch (resolvedTag) {
      @case ("div") {
        <div [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></div>
      }
      @case ("h2") {
        <h2 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h2>
      }
      @case ("h3") {
        <h3 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h3>
      }
      @default {
        <span [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></span>
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Overline, decorators: [{
            type: Component,
            args: [{
                    selector: "st-overline",
                    standalone: true,
                    template: `
    @switch (resolvedTag) {
      @case ("div") {
        <div [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></div>
      }
      @case ("h2") {
        <h2 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h2>
      }
      @case ("h3") {
        <h3 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h3>
      }
      @default {
        <span [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></span>
      }
    }
  `,
                }]
        }], propDecorators: { as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Overline.js.map