import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _tooltipCounter = 0;
function nextTooltipId() {
    return `st-tooltip-${++_tooltipCounter}`;
}
export class Tooltip {
    static stComponentName = "Tooltip";
    componentName = "Tooltip";
    tooltipId = nextTooltipId();
    content;
    placement;
    classInput;
    get hostClass() {
        return classNames("st-tooltip", `st-tooltip--${this.placement ?? "top"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tooltip, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Tooltip, isStandalone: true, selector: "st-tooltip", inputs: { content: "content", placement: "placement", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <span class="st-tooltip__trigger">
        <ng-content></ng-content>
      </span>
      <span
        [id]="tooltipId"
        class="st-tooltip__content"
        role="tooltip"
      >{{ content }}</span>
    </span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tooltip, decorators: [{
            type: Component,
            args: [{
                    selector: "st-tooltip",
                    standalone: true,
                    template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <span class="st-tooltip__trigger">
        <ng-content></ng-content>
      </span>
      <span
        [id]="tooltipId"
        class="st-tooltip__content"
        role="tooltip"
      >{{ content }}</span>
    </span>
  `,
                }]
        }], propDecorators: { content: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Tooltip.js.map