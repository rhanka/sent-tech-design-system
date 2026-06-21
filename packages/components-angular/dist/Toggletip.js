import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Toggletip {
    static stComponentName = "Toggletip";
    componentName = "Toggletip";
    label;
    content;
    open;
    placement;
    classInput;
    localOpen = false;
    get hostClass() {
        return classNames("st-toggletip", `st-toggletip--${this.placement ?? "top"}`, this.classInput);
    }
    toggle() {
        if (this.open !== undefined)
            return;
        this.localOpen = !this.localOpen;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toggletip, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Toggletip, isStandalone: true, selector: "st-toggletip", inputs: { label: "label", content: "content", open: "open", placement: "placement", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <button
        type="button"
        class="st-toggletip__trigger"
        [attr.aria-expanded]="localOpen"
        (click)="toggle()"
      >{{ label }}</button>
      @if (localOpen) {
        <span class="st-toggletip__bubble" role="status">
          <span class="st-toggletip__content">{{ content }}</span>
        </span>
      }
    </span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toggletip, decorators: [{
            type: Component,
            args: [{
                    selector: "st-toggletip",
                    standalone: true,
                    template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <button
        type="button"
        class="st-toggletip__trigger"
        [attr.aria-expanded]="localOpen"
        (click)="toggle()"
      >{{ label }}</button>
      @if (localOpen) {
        <span class="st-toggletip__bubble" role="status">
          <span class="st-toggletip__content">{{ content }}</span>
        </span>
      }
    </span>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], content: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Toggletip.js.map