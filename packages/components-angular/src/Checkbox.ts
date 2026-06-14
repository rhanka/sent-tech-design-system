import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type CheckboxProps = {
  label: string;
  helperText?: string;
  invalid?: boolean;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

@Component({
  selector: "st-checkbox",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Checkbox {
  static readonly stComponentName = "Checkbox";
  readonly componentName = "Checkbox";
  @NgInput() label!: string;
  @NgInput() helperText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() modelValue?: boolean;
  @NgInput() checked?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() name?: string;
  @NgInput() value?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-checkbox", this.classInput].filter(Boolean).join(" ");
  }
}
