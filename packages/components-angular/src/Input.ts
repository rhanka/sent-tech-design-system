import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  size?: InputSize;
  id?: string;
  class?: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
};

@Component({
  selector: "st-input",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Input {
  static readonly stComponentName = "Input";
  readonly componentName = "Input";
  @NgInput() label?: string;
  @NgInput() helperText?: string;
  @NgInput() errorText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() size?: InputSize;
  @NgInput() id?: string;
  @NgInput("class") classInput?: string;
  @NgInput() modelValue?: string;
  @NgInput() placeholder?: string;
  @NgInput() disabled?: boolean;
  @NgInput() readonly?: boolean;

  get hostClass(): string {
    return ["st-input", this.classInput].filter(Boolean).join(" ");
  }
}
