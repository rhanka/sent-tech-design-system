import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ErrorSummary {
    static stComponentName = "ErrorSummary";
    componentName = "ErrorSummary";
    heading;
    errors;
    classInput;
    get hostClass() {
        return classNames("st-errorSummary", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ErrorSummary, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ErrorSummary, isStandalone: true, selector: "st-error-summary", inputs: { heading: "heading", errors: "errors", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="alert">
      @if (heading) { <h2 class="st-errorSummary__heading">{{ heading }}</h2> }
      @if (errors && errors.length) {
        <ul class="st-errorSummary__list">
          @for (err of errors; track err.href) {
            <li class="st-errorSummary__item">
              <a [href]="err.href" class="st-errorSummary__link">{{ err.text }}</a>
            </li>
          }
        </ul>
      }
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ErrorSummary, decorators: [{
            type: Component,
            args: [{
                    selector: "st-error-summary",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="alert">
      @if (heading) { <h2 class="st-errorSummary__heading">{{ heading }}</h2> }
      @if (errors && errors.length) {
        <ul class="st-errorSummary__list">
          @for (err of errors; track err.href) {
            <li class="st-errorSummary__item">
              <a [href]="err.href" class="st-errorSummary__link">{{ err.text }}</a>
            </li>
          }
        </ul>
      }
      <ng-content></ng-content>
    </div>
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