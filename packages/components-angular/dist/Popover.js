import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Popover {
    static stComponentName = "Popover";
    componentName = "Popover";
    content;
    label;
    open;
    placement;
    classInput;
    close = new EventEmitter();
    localOpen = false;
    get isOpen() {
        return this.open !== undefined ? this.open : this.localOpen;
    }
    get hostClass() {
        return classNames("st-popover-host", this.classInput);
    }
    get popoverClass() {
        return classNames("st-popover", `st-popover--${this.placement ?? "bottom"}`);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Popover, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Popover, isStandalone: true, selector: "st-popover", inputs: { content: "content", label: "label", open: "open", placement: "placement", classInput: ["class", "classInput"] }, outputs: { close: "close" }, ngImport: i0, template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      (click)="localOpen = true"
    >
      <ng-content></ng-content>
      @if (isOpen) {
        <section
          [class]="popoverClass"
          role="dialog"
          [attr.aria-label]="label || content || 'Popover'"
        >{{ content }}</section>
      }
    </span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Popover, decorators: [{
            type: Component,
            args: [{
                    selector: "st-popover",
                    standalone: true,
                    template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      (click)="localOpen = true"
    >
      <ng-content></ng-content>
      @if (isOpen) {
        <section
          [class]="popoverClass"
          role="dialog"
          [attr.aria-label]="label || content || 'Popover'"
        >{{ content }}</section>
      }
    </span>
  `,
                }]
        }], propDecorators: { content: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], close: [{
                type: Output
            }] } });
//# sourceMappingURL=Popover.js.map