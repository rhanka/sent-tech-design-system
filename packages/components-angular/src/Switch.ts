import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SwitchProps = {
  label: unknown;
  helperText?: unknown;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

@Component({
  selector: "st-switch",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Switch {
  static readonly stComponentName = "Switch";
  readonly componentName = "Switch";
  @NgInput() label!: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() modelValue?: boolean;
  @NgInput() checked?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() name?: string;
  @NgInput() value?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-switch", this.classInput].filter(Boolean).join(" ");
  }
}
