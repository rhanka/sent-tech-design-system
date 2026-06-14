import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TextareaProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  class?: string;
};

@Component({
  selector: "st-textarea",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Textarea {
  static readonly stComponentName = "Textarea";
  readonly componentName = "Textarea";
  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() modelValue?: string;
  @NgInput() placeholder?: string;
  @NgInput() disabled?: boolean;
  @NgInput() readonly?: boolean;
  @NgInput() rows?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-textarea", this.classInput].filter(Boolean).join(" ");
  }
}
