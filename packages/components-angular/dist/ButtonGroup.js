import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ButtonGroup {
    static stComponentName = "ButtonGroup";
    componentName = "ButtonGroup";
    orientation;
    attached;
    gap;
    size;
    label;
    classInput;
    get gapValue() {
        if (this.attached || this.gap == null)
            return null;
        return `var(--st-spacing-${this.gap}, ${this.gap * 0.25}rem)`;
    }
    get hostClass() {
        return classNames("st-buttonGroup", `st-buttonGroup--${this.orientation ?? "horizontal"}`, this.attached && "st-buttonGroup--attached", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ButtonGroup, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ButtonGroup, isStandalone: true, selector: "st-button-group", inputs: { orientation: "orientation", attached: "attached", gap: "gap", size: "size", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="label ?? null"
      [attr.data-size]="size ?? 'md'"
      [style.gap]="gapValue"
    >
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ButtonGroup, decorators: [{
            type: Component,
            args: [{
                    selector: "st-button-group",
                    standalone: true,
                    template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="label ?? null"
      [attr.data-size]="size ?? 'md'"
      [style.gap]="gapValue"
    >
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { orientation: [{
                type: NgInput
            }], attached: [{
                type: NgInput
            }], gap: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ButtonGroup.js.map