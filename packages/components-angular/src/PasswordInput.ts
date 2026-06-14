import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type PasswordInputSize = "sm" | "md" | "lg";

export type PasswordInputProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  size?: PasswordInputSize;
  modelValue?: string;
  disabled?: boolean;
  placeholder?: string;
  class?: string;
};

@Component({
  selector: "st-password-input",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class PasswordInput {
  static readonly stComponentName = "PasswordInput";
  readonly componentName = "PasswordInput";
  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() size?: PasswordInputSize;
  @NgInput() modelValue?: string;
  @NgInput() disabled?: boolean;
  @NgInput() placeholder?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-passwordInput", this.classInput].filter(Boolean).join(" ");
  }
}
