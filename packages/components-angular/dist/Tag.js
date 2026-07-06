import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Tag {
    static stComponentName = "Tag";
    componentName = "Tag";
    tone;
    size;
    disabled;
    dismissible;
    dismissLabel;
    onDismiss;
    classInput;
    dismiss = new EventEmitter();
    get hostClass() {
        return classNames("st-tag", `st-tag--${this.tone ?? "neutral"}`, `st-tag--${this.size ?? "md"}`, this.disabled && "st-tag--disabled", this.classInput);
    }
    handleDismiss(event) {
        if (this.disabled)
            return;
        this.onDismiss?.(event);
        this.dismiss.emit(event);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tag, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Tag, isStandalone: true, selector: "st-tag", inputs: { tone: "tone", size: "size", disabled: "disabled", dismissible: "dismissible", dismissLabel: "dismissLabel", onDismiss: "onDismiss", classInput: ["class", "classInput"] }, outputs: { dismiss: "dismiss" }, ngImport: i0, template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-disabled]="disabled ? 'true' : null"
    >
      <span class="st-tag__label"><ng-content></ng-content></span>
      @if (dismissible) {
        <button
          type="button"
          class="st-tag__dismiss"
          [attr.aria-label]="dismissLabel ?? 'Dismiss'"
          [disabled]="disabled ?? false"
          (click)="handleDismiss($event)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      }
    </span>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tag, decorators: [{
            type: Component,
            args: [{ selector: "st-tag", standalone: true, template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-disabled]="disabled ? 'true' : null"
    >
      <span class="st-tag__label"><ng-content></ng-content></span>
      @if (dismissible) {
        <button
          type="button"
          class="st-tag__dismiss"
          [attr.aria-label]="dismissLabel ?? 'Dismiss'"
          [disabled]="disabled ?? false"
          (click)="handleDismiss($event)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      }
    </span>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { tone: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], dismissible: [{
                type: NgInput
            }], dismissLabel: [{
                type: NgInput
            }], onDismiss: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], dismiss: [{
                type: Output
            }] } });
//# sourceMappingURL=Tag.js.map