import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _collapsibleCounter = 0;
export class Collapsible {
    static stComponentName = "Collapsible";
    componentName = "Collapsible";
    uid = `st-collapsible-${++_collapsibleCounter}`;
    localOpen = false;
    open;
    title;
    size;
    disabled;
    onToggle;
    classInput;
    toggleChange = new EventEmitter();
    ngOnInit() {
        this.localOpen = this.open ?? false;
    }
    get currentOpen() {
        return this.open ?? this.localOpen;
    }
    get hostClass() {
        return classNames("st-collapsible", `st-collapsible--${this.size ?? "md"}`, this.currentOpen && "st-collapsible--open", this.classInput);
    }
    toggle() {
        if (this.disabled)
            return;
        const next = !this.currentOpen;
        if (this.open === undefined) {
            this.localOpen = next;
        }
        this.onToggle?.(next);
        this.toggleChange.emit(next);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Collapsible, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Collapsible, isStandalone: true, selector: "st-collapsible", inputs: { open: "open", title: "title", size: "size", disabled: "disabled", onToggle: "onToggle", classInput: ["class", "classInput"] }, outputs: { toggleChange: "toggleChange" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button
        type="button"
        class="st-collapsible__trigger"
        [attr.aria-expanded]="currentOpen ? 'true' : 'false'"
        [attr.aria-controls]="uid + '-region'"
        [id]="uid + '-trigger'"
        [disabled]="disabled ?? false"
        (click)="toggle()"
      >
        <span class="st-collapsible__title">{{ title }}</span>
        <span class="st-collapsible__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      @if (currentOpen) {
        <div
          class="st-collapsible__region"
          role="region"
          [id]="uid + '-region'"
          [attr.aria-labelledby]="uid + '-trigger'"
        >
          <ng-content></ng-content>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Collapsible, decorators: [{
            type: Component,
            args: [{
                    selector: "st-collapsible",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button
        type="button"
        class="st-collapsible__trigger"
        [attr.aria-expanded]="currentOpen ? 'true' : 'false'"
        [attr.aria-controls]="uid + '-region'"
        [id]="uid + '-trigger'"
        [disabled]="disabled ?? false"
        (click)="toggle()"
      >
        <span class="st-collapsible__title">{{ title }}</span>
        <span class="st-collapsible__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      @if (currentOpen) {
        <div
          class="st-collapsible__region"
          role="region"
          [id]="uid + '-region'"
          [attr.aria-labelledby]="uid + '-trigger'"
        >
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { open: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], onToggle: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], toggleChange: [{
                type: Output
            }] } });
//# sourceMappingURL=Collapsible.js.map