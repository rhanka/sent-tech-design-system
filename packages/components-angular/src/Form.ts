import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FormStatus = "idle" | "submitting" | "submitted" | "error";

export type FormProps = {
  status?: FormStatus;
  message?: string;
  class?: string;
};

@Component({
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
})
export class Form {
  static readonly stComponentName = "Form";
  readonly componentName = "Form";
  @NgInput() status?: FormStatus;
  @NgInput() message?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-form",
      this.status && `st-form--${this.status}`,
      this.classInput,
    );
  }
}
