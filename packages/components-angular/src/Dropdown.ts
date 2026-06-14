import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type DropdownOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

// In addition to the Vue-native `@select` emit, an `onSelect` callback prop
// (React/Svelte parity) is accepted; both fire on selection.
export type DropdownProps = {
  label?: string;
  options: DropdownOption[];
  value?: string;
  open?: boolean;
  placeholder?: string;
  onSelect?: (value: string) => void;
  class?: string;
};

@Component({
  selector: "st-dropdown",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Dropdown {
  static readonly stComponentName = "Dropdown";
  readonly componentName = "Dropdown";
  @NgInput() label?: string;
  @NgInput() options!: DropdownOption[];
  @NgInput() value?: string;
  @NgInput() open?: boolean;
  @NgInput() placeholder?: string;
  @NgInput() onSelect?: (value: string) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-dropdown", this.classInput].filter(Boolean).join(" ");
  }
}
