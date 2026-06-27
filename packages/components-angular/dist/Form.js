import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Form {
    static stComponentName = "Form";
    componentName = "Form";
    helperText;
    errorText;
    successText;
    submitting;
    noNoscript;
    classInput;
    submit = new EventEmitter();
    get showError() {
        return Boolean(this.errorText);
    }
    get showSuccess() {
        return !this.showError && Boolean(this.successText);
    }
    get showHelper() {
        return !this.showError && !this.showSuccess && Boolean(this.helperText);
    }
    get hostClass() {
        return classNames("st-form", this.classInput);
    }
    onSubmit(event) {
        this.submit.emit(event);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Form, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Form, isStandalone: true, selector: "st-form", inputs: { helperText: "helperText", errorText: "errorText", successText: "successText", submitting: "submitting", noNoscript: "noNoscript", classInput: ["class", "classInput"] }, outputs: { submit: "submit" }, ngImport: i0, template: `
    <form
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-busy]="submitting ? 'true' : null"
      (submit)="onSubmit($event)"
    >
      <div class="st-form__body">
        <ng-content></ng-content>
      </div>
      @if (showError) {
        <p class="st-form__message st-form__message--error" role="alert">{{ errorText }}</p>
      } @else if (showSuccess) {
        <p class="st-form__message st-form__message--success" role="status">{{ successText }}</p>
      } @else if (showHelper) {
        <p class="st-form__message st-form__message--help">{{ helperText }}</p>
      }
      @if (!noNoscript) {
        <noscript>
          <p class="st-form__message st-form__message--error">
            JavaScript is required to submit this form.
          </p>
        </noscript>
      }
    </form>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Form, decorators: [{
            type: Component,
            args: [{
                    selector: "st-form",
                    standalone: true,
                    template: `
    <form
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-busy]="submitting ? 'true' : null"
      (submit)="onSubmit($event)"
    >
      <div class="st-form__body">
        <ng-content></ng-content>
      </div>
      @if (showError) {
        <p class="st-form__message st-form__message--error" role="alert">{{ errorText }}</p>
      } @else if (showSuccess) {
        <p class="st-form__message st-form__message--success" role="status">{{ successText }}</p>
      } @else if (showHelper) {
        <p class="st-form__message st-form__message--help">{{ helperText }}</p>
      }
      @if (!noNoscript) {
        <noscript>
          <p class="st-form__message st-form__message--error">
            JavaScript is required to submit this form.
          </p>
        </noscript>
      }
    </form>
  `,
                }]
        }], propDecorators: { helperText: [{
                type: NgInput
            }], errorText: [{
                type: NgInput
            }], successText: [{
                type: NgInput
            }], submitting: [{
                type: NgInput
            }], noNoscript: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], submit: [{
                type: Output
            }] } });
//# sourceMappingURL=Form.js.map