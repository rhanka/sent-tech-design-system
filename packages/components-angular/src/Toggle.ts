import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ToggleSize = "sm" | "md";

export type ToggleProps = {
  label: unknown;
  labelOn?: string;
  labelOff?: string;
  helperText?: unknown;
  size?: ToggleSize;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

@Component({
  selector: "st-toggle",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Toggle {
  static readonly stComponentName = "Toggle";
  readonly componentName = "Toggle";
  @NgInput() label!: unknown;
  @NgInput() labelOn?: string;
  @NgInput() labelOff?: string;
  @NgInput() helperText?: unknown;
  @NgInput() size?: ToggleSize;
  @NgInput() modelValue?: boolean;
  @NgInput() checked?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() name?: string;
  @NgInput() value?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-toggle", this.classInput].filter(Boolean).join(" ");
  }
}
