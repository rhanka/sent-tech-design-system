import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ComboboxOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type ComboboxSize = "sm" | "md" | "lg";

export type ComboboxProps = {
  label?: unknown;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  options: ComboboxOption[];
  value?: string;
  size?: ComboboxSize;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  allowCustomValue?: boolean;
  noResultsLabel?: unknown;
  listLabel?: string;
  class?: string;
};

@Component({
  selector: "st-combobox",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Combobox {
  static readonly stComponentName = "Combobox";
  readonly componentName = "Combobox";
  @NgInput() label?: unknown;
  @NgInput() helperText?: string;
  @NgInput() errorText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() options!: ComboboxOption[];
  @NgInput() value?: string;
  @NgInput() size?: ComboboxSize;
  @NgInput() placeholder?: string;
  @NgInput() disabled?: boolean;
  @NgInput() open?: boolean;
  @NgInput() allowCustomValue?: boolean;
  @NgInput() noResultsLabel?: unknown;
  @NgInput() listLabel?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-combobox", this.classInput].filter(Boolean).join(" ");
  }
}
