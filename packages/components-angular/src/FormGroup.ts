import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FormGroupProps = {
  legend: unknown;
  helperText?: unknown;
  class?: string;
};

@Component({
  selector: "st-form-group",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class FormGroup {
  static readonly stComponentName = "FormGroup";
  readonly componentName = "FormGroup";
  @NgInput() legend!: unknown;
  @NgInput() helperText?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-formGroup", this.classInput].filter(Boolean).join(" ");
  }
}
