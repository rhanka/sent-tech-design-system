import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FormGroupProps = {
  legend?: unknown;
  helperText?: unknown;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-form-group",
  standalone: true,
  template: `
    <fieldset
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [disabled]="disabled ?? false"
    >
      @if (legend) { <legend class="st-form-group__legend">{{ legend }}</legend> }
      <div class="st-form-group__body">
        <ng-content></ng-content>
      </div>
      @if (helperText) { <p class="st-form-group__help">{{ helperText }}</p> }
    </fieldset>
  `,
})
export class FormGroup {
  static readonly stComponentName = "FormGroup";
  readonly componentName = "FormGroup";
  @NgInput() legend?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-form-group", this.classInput);
  }
}
