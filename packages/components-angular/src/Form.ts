import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type FormStatus = "idle" | "submitting" | "submitted" | "error";

export type FormProps = {
  helperText?: string;
  errorText?: string;
  successText?: string;
  submitting?: boolean;
  noNoscript?: boolean;
  class?: string;
};

@Component({
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
})
export class Form {
  static readonly stComponentName = "Form";
  readonly componentName = "Form";

  @NgInput() helperText?: string;
  @NgInput() errorText?: string;
  @NgInput() successText?: string;
  @NgInput() submitting?: boolean;
  @NgInput() noNoscript?: boolean;
  @NgInput("class") classInput?: string;

  @Output() readonly submit = new EventEmitter<SubmitEvent>();

  get showError(): boolean {
    return Boolean(this.errorText);
  }

  get showSuccess(): boolean {
    return !this.showError && Boolean(this.successText);
  }

  get showHelper(): boolean {
    return !this.showError && !this.showSuccess && Boolean(this.helperText);
  }

  get hostClass(): string {
    return classNames("st-form", this.classInput);
  }

  onSubmit(event: Event): void {
    this.submit.emit(event as SubmitEvent);
  }
}
