import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Modal {
    static stComponentName = "Modal";
    componentName = "Modal";
    open;
    title;
    description;
    size;
    closeLabel;
    classInput;
    close = new EventEmitter();
    get hostClass() {
        return classNames("st-modal", this.size && `st-modal--${this.size}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Modal, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Modal, isStandalone: true, selector: "st-modal", inputs: { open: "open", title: "title", description: "description", size: "size", closeLabel: "closeLabel", classInput: ["class", "classInput"] }, outputs: { close: "close" }, ngImport: i0, template: `
    @if (open) {
      <div class="st-modal__backdrop">
        <section
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || 'Modal'"
        >
          <div class="st-modal__header">
            @if (title) {
              <h2 class="st-modal__title">{{ title }}</h2>
            }
            <button
              type="button"
              class="st-modal__close"
              [attr.aria-label]="closeLabel || 'Close'"
              (click)="close.emit()"
            >&#x2715;</button>
          </div>
          @if (description) {
            <p class="st-modal__description">{{ description }}</p>
          }
          <div class="st-modal__body">
            <ng-content></ng-content>
          </div>
          <div class="st-modal__footer">
            <ng-content select="[slot='footer']"></ng-content>
          </div>
        </section>
      </div>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Modal, decorators: [{
            type: Component,
            args: [{
                    selector: "st-modal",
                    standalone: true,
                    template: `
    @if (open) {
      <div class="st-modal__backdrop">
        <section
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || 'Modal'"
        >
          <div class="st-modal__header">
            @if (title) {
              <h2 class="st-modal__title">{{ title }}</h2>
            }
            <button
              type="button"
              class="st-modal__close"
              [attr.aria-label]="closeLabel || 'Close'"
              (click)="close.emit()"
            >&#x2715;</button>
          </div>
          @if (description) {
            <p class="st-modal__description">{{ description }}</p>
          }
          <div class="st-modal__body">
            <ng-content></ng-content>
          </div>
          <div class="st-modal__footer">
            <ng-content select="[slot='footer']"></ng-content>
          </div>
        </section>
      </div>
    }
  `,
                }]
        }], propDecorators: { open: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], description: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], closeLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], close: [{
                type: Output
            }] } });
//# sourceMappingURL=Modal.js.map