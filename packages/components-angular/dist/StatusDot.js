import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class StatusDot {
    static stComponentName = "StatusDot";
    componentName = "StatusDot";
    tone = "neutral";
    color;
    size = 8;
    pulse = false;
    label;
    classInput;
    get safeSize() {
        return Math.max(Number(this.size ?? 8) || 0, 1);
    }
    get accessibleLabel() {
        return this.label ?? this.color ?? this.tone;
    }
    get hostClass() {
        return classNames("st-statusDot", this.classInput);
    }
    get dotClass() {
        return classNames("st-statusDot__dot", this.color ? null : `st-statusDot__dot--${this.tone}`, this.pulse ? "st-statusDot__dot--pulse" : null);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StatusDot, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StatusDot, isStandalone: true, selector: "st-status-dot", inputs: { tone: "tone", color: "color", size: "size", pulse: "pulse", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <span [class]="dotClass"
          [style.background-color]="color || null"
          [style.width.px]="safeSize"
          [style.height.px]="safeSize"
          aria-hidden="true"></span>
        <span class="st-statusDot__label">{{ label }}</span>
      } @else {
        <span [class]="dotClass"
          [style.background-color]="color || null"
          [style.width.px]="safeSize"
          [style.height.px]="safeSize"
          role="img"
          [attr.aria-label]="accessibleLabel"></span>
      }
    </span>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StatusDot, decorators: [{
            type: Component,
            args: [{ selector: "st-status-dot", standalone: true, template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <span [class]="dotClass"
          [style.background-color]="color || null"
          [style.width.px]="safeSize"
          [style.height.px]="safeSize"
          aria-hidden="true"></span>
        <span class="st-statusDot__label">{{ label }}</span>
      } @else {
        <span [class]="dotClass"
          [style.background-color]="color || null"
          [style.width.px]="safeSize"
          [style.height.px]="safeSize"
          role="img"
          [attr.aria-label]="accessibleLabel"></span>
      }
    </span>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { tone: [{
                type: NgInput
            }], color: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], pulse: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StatusDot.js.map