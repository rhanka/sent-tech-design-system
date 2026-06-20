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
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass">
      @if (legend) { <legend class="st-formGroup__legend">{{ legend }}</legend> }
      <ng-content></ng-content>
      @if (helperText) { <p class="st-formGroup__helper">{{ helperText }}</p> }
    </fieldset>
  `,
})
export class FormGroup {
  static readonly stComponentName = "FormGroup";
  readonly componentName = "FormGroup";
  @NgInput() legend!: unknown;
  @NgInput() helperText?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-formGroup", this.classInput);
  }
}
