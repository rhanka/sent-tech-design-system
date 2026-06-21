import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Popover {
    static stComponentName = "Popover";
    componentName = "Popover";
    content;
    label;
    triggerLabel;
    open;
    placement;
    openOn;
    classInput;
    close = new EventEmitter();
    localOpen = false;
    hovered = false;
    get isOpen() {
        if (this.open !== undefined)
            return this.open;
        if (this.openOn === "hover")
            return this.hovered;
        return this.localOpen;
    }
    get popoverClass() {
        return classNames("st-popover", `st-popover--${this.placement ?? "bottom"}`);
    }
    onHover(value) {
        this.hovered = value;
    }
    onHostClick() {
        if (this.open === undefined && this.openOn !== "hover") {
            this.localOpen = !this.localOpen;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Popover, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Popover, isStandalone: true, selector: "st-popover", inputs: { content: "content", label: "label", triggerLabel: "triggerLabel", open: "open", placement: "placement", openOn: "openOn", classInput: ["class", "classInput"] }, outputs: { close: "close" }, ngImport: i0, template: `
    <span
      [attr.data-st-component]="componentName"
      class="st-popover-host"
      (mouseenter)="onHover(true)"
      (mouseleave)="onHover(false)"
      (focusin)="onHover(true)"
      (focusout)="onHover(false)"
      (click)="onHostClick()"
    >
      @if (triggerLabel) {
        <button type="button" class="st-popover__trigger">{{ triggerLabel }}</button>
      }
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
      class="st-popover-host"
      (mouseenter)="onHover(true)"
      (mouseleave)="onHover(false)"
      (focusin)="onHover(true)"
      (focusout)="onHover(false)"
      (click)="onHostClick()"
    >
      @if (triggerLabel) {
        <button type="button" class="st-popover__trigger">{{ triggerLabel }}</button>
      }
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
            }], triggerLabel: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], openOn: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], close: [{
                type: Output
            }] } });
//# sourceMappingURL=Popover.js.map