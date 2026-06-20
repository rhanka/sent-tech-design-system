import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

/** A single field error: `href` points to the offending control, `text` is the message. */
export type ErrorSummaryItem = { href: string; text: string };

export type ErrorSummaryProps = {
  heading?: string;
  errors?: ErrorSummaryItem[];
  class?: string;
};

@Component({
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
})
export class ErrorSummary {
  static readonly stComponentName = "ErrorSummary";
  readonly componentName = "ErrorSummary";
  @NgInput() heading?: string;
  @NgInput() errors?: ErrorSummaryItem[];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-errorSummary", this.classInput);
  }
}
