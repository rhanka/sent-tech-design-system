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
        return classNames("st-tag", this.tone && `st-tag--${this.tone}`, this.size && `st-tag--${this.size}`, this.disabled && "st-tag--disabled", this.dismissible && "st-tag--dismissible", this.classInput);
    }
    handleDismiss(event) {
        this.onDismiss?.(event);
        this.dismiss.emit(event);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tag, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Tag, isStandalone: true, selector: "st-tag", inputs: { tone: "tone", size: "size", disabled: "disabled", dismissible: "dismissible", dismissLabel: "dismissLabel", onDismiss: "onDismiss", classInput: ["class", "classInput"] }, outputs: { dismiss: "dismiss" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <span class="st-tag__label"><ng-content></ng-content></span>
      @if (dismissible) {
        <button
          type="button"
          class="st-tag__dismiss"
          [attr.aria-label]="dismissLabel ?? 'Supprimer'"
          [disabled]="disabled ?? false"
          (click)="handleDismiss($event)"
        >&#x2715;</button>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tag, decorators: [{
            type: Component,
            args: [{
                    selector: "st-tag",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <span class="st-tag__label"><ng-content></ng-content></span>
      @if (dismissible) {
        <button
          type="button"
          class="st-tag__dismiss"
          [attr.aria-label]="dismissLabel ?? 'Supprimer'"
          [disabled]="disabled ?? false"
          (click)="handleDismiss($event)"
        >&#x2715;</button>
      }
    </div>
  `,
                }]
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