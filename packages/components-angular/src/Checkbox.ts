import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type CheckboxProps = {
  label: string;
  helperText?: string;
  /** Secondary muted description line under the label (e.g. a filter hint). */
  description?: string;
  /** Trailing slot pushed to the row end (e.g. a count Badge). */
  trailing?: unknown;
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
  @NgInput() description?: string;
  @NgInput() trailing?: unknown;
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
