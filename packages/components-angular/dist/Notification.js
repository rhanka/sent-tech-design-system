import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Notification {
    static stComponentName = "Notification";
    componentName = "Notification";
    tone;
    title;
    message;
    dismissible;
    dismissLabel;
    locale;
    classInput;
    get resolvedDismissLabel() {
        const isFr = (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
        return this.dismissLabel ?? (isFr ? "Fermer" : "Dismiss");
    }
    dismiss = new EventEmitter();
    get hostClass() {
        return classNames("st-notification", this.tone && `st-notification--${this.tone}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Notification, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Notification, isStandalone: true, selector: "st-notification", inputs: { tone: "tone", title: "title", message: "message", dismissible: "dismissible", dismissLabel: "dismissLabel", locale: "locale", classInput: ["class", "classInput"] }, outputs: { dismiss: "dismiss" }, ngImport: i0, template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="tone === 'error' ? 'alert' : 'status'"
    >
      <div class="st-notification__content">
        <h2 class="st-notification__title">{{ title }}</h2>
        @if (message) {
          <p class="st-notification__message">{{ message }}</p>
        }
        <ng-content></ng-content>
      </div>
      <div class="st-notification__meta">
        <div class="st-notification__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
        @if (dismissible) {
          <button
            type="button"
            class="st-notification__close"
            [attr.aria-label]="resolvedDismissLabel"
            [attr.title]="resolvedDismissLabel"
            (click)="dismiss.emit()"
          >&#xD7;</button>
        }
      </div>
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Notification, decorators: [{
            type: Component,
            args: [{
                    selector: "st-notification",
                    standalone: true,
                    template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="tone === 'error' ? 'alert' : 'status'"
    >
      <div class="st-notification__content">
        <h2 class="st-notification__title">{{ title }}</h2>
        @if (message) {
          <p class="st-notification__message">{{ message }}</p>
        }
        <ng-content></ng-content>
      </div>
      <div class="st-notification__meta">
        <div class="st-notification__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
        @if (dismissible) {
          <button
            type="button"
            class="st-notification__close"
            [attr.aria-label]="resolvedDismissLabel"
            [attr.title]="resolvedDismissLabel"
            (click)="dismiss.emit()"
          >&#xD7;</button>
        }
      </div>
    </section>
  `,
                }]
        }], propDecorators: { tone: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], message: [{
                type: NgInput
            }], dismissible: [{
                type: NgInput
            }], dismissLabel: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], dismiss: [{
                type: Output
            }] } });
//# sourceMappingURL=Notification.js.map