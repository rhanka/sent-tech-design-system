import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class StatusDot {
    static stComponentName = "StatusDot";
    componentName = "StatusDot";
    tone;
    color;
    size;
    pulse;
    label;
    classInput;
    get hostClass() {
        return classNames("st-statusDot", this.tone && `st-statusDot--${this.tone}`, this.pulse && "st-statusDot--pulse", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StatusDot, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StatusDot, isStandalone: true, selector: "st-status-dot", inputs: { tone: "tone", color: "color", size: "size", pulse: "pulse", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      <span class="st-statusDot__dot"
        [style.background-color]="color || null"
        [style.width.px]="size ?? 8"
        [style.height.px]="size ?? 8"
        aria-hidden="true"></span>
      @if (label) { <span class="st-statusDot__label">{{ label }}</span> }
    </span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StatusDot, decorators: [{
            type: Component,
            args: [{
                    selector: "st-status-dot",
                    standalone: true,
                    template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      <span class="st-statusDot__dot"
        [style.background-color]="color || null"
        [style.width.px]="size ?? 8"
        [style.height.px]="size ?? 8"
        aria-hidden="true"></span>
      @if (label) { <span class="st-statusDot__label">{{ label }}</span> }
    </span>
  `,
                }]
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