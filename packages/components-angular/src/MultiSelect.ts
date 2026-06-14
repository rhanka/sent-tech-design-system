import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type MultiSelectOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type MultiSelectSize = "sm" | "md" | "lg";

export type MultiSelectProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  options: MultiSelectOption[];
  value?: string[];
  values?: string[];
  /** Svelte-canonical alias for the selected values. */
  selected?: string[];
  size?: MultiSelectSize;
  open?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  toggleLabel?: string;
  removeLabel?: string;
  listLabel?: string;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-multi-select",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class MultiSelect {
  static readonly stComponentName = "MultiSelect";
  readonly componentName = "MultiSelect";
  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() options!: MultiSelectOption[];
  @NgInput() value?: string[];
  @NgInput() values?: string[];
  @NgInput() selected?: string[];
  @NgInput() size?: MultiSelectSize;
  @NgInput() open?: boolean;
  @NgInput() placeholder?: string;
  @NgInput() searchPlaceholder?: string;
  @NgInput() noResultsLabel?: string;
  @NgInput() toggleLabel?: string;
  @NgInput() removeLabel?: string;
  @NgInput() listLabel?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-multiSelect", this.classInput].filter(Boolean).join(" ");
  }
}
