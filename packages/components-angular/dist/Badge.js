import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Badge {
    static stComponentName = "Badge";
    componentName = "Badge";
    tone;
    shape;
    size;
    label;
    classInput;
    get hostClass() {
        return classNames("st-badge", `st-badge--${this.tone ?? "neutral"}`, `st-badge--${this.shape ?? "pill"}`, `st-badge--${this.size ?? "md"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Badge, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Badge, isStandalone: true, selector: "st-badge", inputs: { tone: "tone", shape: "shape", size: "size", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label !== undefined) {
        {{ label }}
      } @else {
        <ng-content></ng-content>
      }
    </span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Badge, decorators: [{
            type: Component,
            args: [{
                    selector: "st-badge",
                    standalone: true,
                    template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label !== undefined) {
        {{ label }}
      } @else {
        <ng-content></ng-content>
      }
    </span>
  `,
                }]
        }], propDecorators: { tone: [{
                type: NgInput
            }], shape: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Badge.js.map