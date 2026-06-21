import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Toast {
    static stComponentName = "Toast";
    componentName = "Toast";
    open = false;
    tone;
    title;
    message;
    items;
    autoDismiss;
    duration;
    closeLabel;
    classInput;
    close = new EventEmitter();
    get hostClass() {
        return classNames("st-toast", `st-toast--${this.tone ?? "info"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toast, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Toast, isStandalone: true, selector: "st-toast", inputs: { open: "open", tone: "tone", title: "title", message: "message", items: "items", autoDismiss: "autoDismiss", duration: "duration", closeLabel: "closeLabel", classInput: ["class", "classInput"] }, outputs: { close: "close" }, ngImport: i0, template: `
    @if (open) {
      <section
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [attr.role]="tone === 'error' ? 'alert' : 'status'"
      >
        <div class="st-toast__content">
          @if (title) {
            <h2 class="st-toast__title">{{ title }}</h2>
          }
          @if (message) {
            <p class="st-toast__message">{{ message }}</p>
          }
          @if (!message) {
            <ng-content></ng-content>
          }
        </div>
        <div class="st-toast__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
        <button
          type="button"
          class="st-toast__close"
          (click)="close.emit()"
        >{{ closeLabel || 'Close' }}</button>
      </section>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toast, decorators: [{
            type: Component,
            args: [{
                    selector: "st-toast",
                    standalone: true,
                    template: `
    @if (open) {
      <section
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [attr.role]="tone === 'error' ? 'alert' : 'status'"
      >
        <div class="st-toast__content">
          @if (title) {
            <h2 class="st-toast__title">{{ title }}</h2>
          }
          @if (message) {
            <p class="st-toast__message">{{ message }}</p>
          }
          @if (!message) {
            <ng-content></ng-content>
          }
        </div>
        <div class="st-toast__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
        <button
          type="button"
          class="st-toast__close"
          (click)="close.emit()"
        >{{ closeLabel || 'Close' }}</button>
      </section>
    }
  `,
                }]
        }], propDecorators: { open: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], message: [{
                type: NgInput
            }], items: [{
                type: NgInput
            }], autoDismiss: [{
                type: NgInput
            }], duration: [{
                type: NgInput
            }], closeLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], close: [{
                type: Output
            }] } });
//# sourceMappingURL=Toast.js.map