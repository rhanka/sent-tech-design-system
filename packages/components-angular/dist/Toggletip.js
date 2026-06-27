import { Component, EventEmitter, HostListener, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Toggletip {
    static stComponentName = "Toggletip";
    componentName = "Toggletip";
    content;
    label;
    open;
    placement;
    triggerLabel;
    classInput;
    openChange = new EventEmitter();
    isOpen = false;
    ngOnChanges(changes) {
        if (changes["open"] && this.open !== undefined) {
            this.isOpen = this.open;
        }
    }
    get hostClass() {
        return classNames("st-toggletip", `st-toggletip--${this.placement ?? "top"}`, this.classInput);
    }
    toggle() {
        this.isOpen = !this.isOpen;
        this.openChange.emit(this.isOpen);
    }
    close() {
        if (this.isOpen) {
            this.isOpen = false;
            this.openChange.emit(false);
        }
    }
    onKeydown(event) {
        if (event.key === "Escape" && this.isOpen) {
            event.preventDefault();
            this.close();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toggletip, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Toggletip, isStandalone: true, selector: "st-toggletip", inputs: { content: "content", label: "label", open: "open", placement: "placement", triggerLabel: "triggerLabel", classInput: ["class", "classInput"] }, outputs: { openChange: "openChange" }, host: { listeners: { "document:keydown": "onKeydown($event)" } }, usesOnChanges: true, ngImport: i0, template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
      <button
        type="button"
        class="st-toggletip__trigger"
        [attr.aria-label]="triggerLabel ?? label ?? 'More information'"
        [attr.aria-expanded]="isOpen ? 'true' : 'false'"
        (click)="toggle()"
      >
        <span aria-hidden="true">i</span>
      </button>
      @if (isOpen) {
        <span class="st-toggletip__bubble" role="status" aria-live="polite">
          @if (label) {
            <span class="st-toggletip__label">{{ label }}</span>
          }
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
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
      <button
        type="button"
        class="st-toggletip__trigger"
        [attr.aria-label]="triggerLabel ?? label ?? 'More information'"
        [attr.aria-expanded]="isOpen ? 'true' : 'false'"
        (click)="toggle()"
      >
        <span aria-hidden="true">i</span>
      </button>
      @if (isOpen) {
        <span class="st-toggletip__bubble" role="status" aria-live="polite">
          @if (label) {
            <span class="st-toggletip__label">{{ label }}</span>
          }
          <span class="st-toggletip__content">{{ content }}</span>
        </span>
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
            }], triggerLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], openChange: [{
                type: Output
            }], onKeydown: [{
                type: HostListener,
                args: ["document:keydown", ["$event"]]
            }] } });
//# sourceMappingURL=Toggletip.js.map