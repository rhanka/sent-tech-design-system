import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Toast {
    static stComponentName = "Toast";
    componentName = "Toast";
    tone;
    title;
    message;
    actions;
    classInput;
    get role() {
        return this.tone === "error" ? "alert" : "status";
    }
    get hostClass() {
        return classNames("st-toast", `st-toast--${this.tone ?? "info"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toast, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Toast, isStandalone: true, selector: "st-toast", inputs: { tone: "tone", title: "title", message: "message", actions: "actions", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role"
    >
      <div class="st-toast__content">
        <h2 class="st-toast__title">{{ title }}</h2>
        @if (message) {
          <p class="st-toast__message">{{ message }}</p>
        }
      </div>
      @if (actions) {
        <div class="st-toast__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
      }
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toast, decorators: [{
            type: Component,
            args: [{
                    selector: "st-toast",
                    standalone: true,
                    template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role"
    >
      <div class="st-toast__content">
        <h2 class="st-toast__title">{{ title }}</h2>
        @if (message) {
          <p class="st-toast__message">{{ message }}</p>
        }
      </div>
      @if (actions) {
        <div class="st-toast__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
      }
    </section>
  `,
                }]
        }], propDecorators: { tone: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], message: [{
                type: NgInput
            }], actions: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Toast.js.map