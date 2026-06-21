import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Form {
    static stComponentName = "Form";
    componentName = "Form";
    status;
    message;
    classInput;
    get hostClass() {
        return classNames("st-form", this.status && `st-form--${this.status}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Form, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Form, isStandalone: true, selector: "st-form", inputs: { status: "status", message: "message", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <form [attr.data-st-component]="componentName" [class]="hostClass">
      @if (status && status !== 'idle') {
        <div class="st-form__status" [attr.data-status]="status">
          @if (message) { <p class="st-form__message">{{ message }}</p> }
        </div>
      }
      <ng-content></ng-content>
    </form>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Form, decorators: [{
            type: Component,
            args: [{
                    selector: "st-form",
                    standalone: true,
                    template: `
    <form [attr.data-st-component]="componentName" [class]="hostClass">
      @if (status && status !== 'idle') {
        <div class="st-form__status" [attr.data-status]="status">
          @if (message) { <p class="st-form__message">{{ message }}</p> }
        </div>
      }
      <ng-content></ng-content>
    </form>
  `,
                }]
        }], propDecorators: { status: [{
                type: NgInput
            }], message: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Form.js.map