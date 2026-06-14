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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
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
    return ["st-errorSummary", this.classInput].filter(Boolean).join(" ");
  }
}
