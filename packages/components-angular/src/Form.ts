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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Form {
  static readonly stComponentName = "Form";
  readonly componentName = "Form";
  @NgInput() status?: FormStatus;
  @NgInput() message?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-form", this.classInput].filter(Boolean).join(" ");
  }
}
