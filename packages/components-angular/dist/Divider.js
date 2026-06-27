import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";
import { classNames } from "./classNames.js";
import { spacingToken } from "./Flex.js";
import * as i0 from "@angular/core";
export class Divider {
    static stComponentName = "Divider";
    componentName = "Divider";
    orientation;
    spacing;
    label;
    variant = "solid";
    classInput;
    get isLabeled() {
        return ((this.orientation ?? "horizontal") !== "vertical" &&
            this.label != null &&
            this.label !== "");
    }
    get hostClass() {
        return classNames("st-divider", `st-divider--${this.orientation ?? "horizontal"}`, `st-divider--${this.variant ?? "solid"}`, this.isLabeled && "st-divider--labeled", this.classInput);
    }
    get spacingStyle() {
        const margin = this.spacing != null ? spacingToken(this.spacing) : undefined;
        const isVertical = (this.orientation ?? "horizontal") === "vertical";
        return {
            "margin-block": isVertical ? undefined : margin,
            "margin-inline": isVertical ? margin : undefined,
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Divider, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Divider, isStandalone: true, selector: "st-divider", inputs: { orientation: "orientation", spacing: "spacing", label: "label", variant: "variant", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    @if (isLabeled) {
      <div [attr.data-st-component]="componentName" [class]="hostClass"
        role="separator" aria-orientation="horizontal" [ngStyle]="spacingStyle">
        <span class="st-divider__line" aria-hidden="true"></span>
        <span class="st-divider__label">{{ label }}</span>
        <span class="st-divider__line" aria-hidden="true"></span>
      </div>
    } @else {
      <div [attr.data-st-component]="componentName" [class]="hostClass"
        role="separator" [attr.aria-orientation]="orientation ?? 'horizontal'" [ngStyle]="spacingStyle"></div>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Divider, decorators: [{
            type: Component,
            args: [{
                    selector: "st-divider",
                    standalone: true,
                    imports: [NgStyle],
                    template: `
    @if (isLabeled) {
      <div [attr.data-st-component]="componentName" [class]="hostClass"
        role="separator" aria-orientation="horizontal" [ngStyle]="spacingStyle">
        <span class="st-divider__line" aria-hidden="true"></span>
        <span class="st-divider__label">{{ label }}</span>
        <span class="st-divider__line" aria-hidden="true"></span>
      </div>
    } @else {
      <div [attr.data-st-component]="componentName" [class]="hostClass"
        role="separator" [attr.aria-orientation]="orientation ?? 'horizontal'" [ngStyle]="spacingStyle"></div>
    }
  `,
                }]
        }], propDecorators: { orientation: [{
                type: NgInput
            }], spacing: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Divider.js.map