import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type RadioProps = {
  label: string;
  helperText?: string;
  invalid?: boolean;
  modelValue?: string;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

@Component({
  selector: "st-radio",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Radio {
  static readonly stComponentName = "Radio";
  readonly componentName = "Radio";
  @NgInput() label!: string;
  @NgInput() helperText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() modelValue?: string;
  @NgInput() checked?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() name?: string;
  @NgInput() value?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-radio", this.classInput].filter(Boolean).join(" ");
  }
}
