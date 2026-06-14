import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SelectSize = "sm" | "md" | "lg";

export type SelectOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type SelectProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  size?: SelectSize;
  options?: SelectOption[];
  modelValue?: string;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-select",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Select {
  static readonly stComponentName = "Select";
  readonly componentName = "Select";
  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() size?: SelectSize;
  @NgInput() options?: SelectOption[];
  @NgInput() modelValue?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-select", this.classInput].filter(Boolean).join(" ");
  }
}
