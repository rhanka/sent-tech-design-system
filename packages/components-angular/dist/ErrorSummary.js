import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ErrorSummary {
    static stComponentName = "ErrorSummary";
    componentName = "ErrorSummary";
    heading = "There was a problem";
    errors = [];
    classInput;
    get hostClass() {
        return classNames("st-error-summary", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ErrorSummary, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ErrorSummary, isStandalone: true, selector: "st-error-summary", inputs: { heading: "heading", errors: "errors", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass" role="alert" tabindex="-1">
      <h2 class="st-error-summary__heading">{{ heading }}</h2>
      @if (errors && errors.length > 0) {
        <ul class="st-error-summary__list">
          @for (err of errors; track err.href) {
            <li class="st-error-summary__item">
              <a [href]="err.href" class="st-error-summary__link">{{ err.text }}</a>
            </li>
          }
        </ul>
      }
      <ng-content></ng-content>
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ErrorSummary, decorators: [{
            type: Component,
            args: [{
                    selector: "st-error-summary",
                    standalone: true,
                    template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass" role="alert" tabindex="-1">
      <h2 class="st-error-summary__heading">{{ heading }}</h2>
      @if (errors && errors.length > 0) {
        <ul class="st-error-summary__list">
          @for (err of errors; track err.href) {
            <li class="st-error-summary__item">
              <a [href]="err.href" class="st-error-summary__link">{{ err.text }}</a>
            </li>
          }
        </ul>
      }
      <ng-content></ng-content>
    </section>
  `,
                }]
        }], propDecorators: { heading: [{
                type: NgInput
            }], errors: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ErrorSummary.js.map