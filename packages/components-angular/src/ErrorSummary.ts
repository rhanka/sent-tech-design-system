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
})
export class ErrorSummary {
  static readonly stComponentName = "ErrorSummary";
  readonly componentName = "ErrorSummary";
  @NgInput() heading = "There was a problem";
  @NgInput() errors: ErrorSummaryItem[] = [];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-error-summary", this.classInput);
  }
}
