import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type NumberInputSize = "sm" | "md" | "lg";

export type NumberInputProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  size?: NumberInputSize;
  modelValue?: number | string;
  /** Svelte/React-canonical alias for `modelValue`. */
  value?: number | string | null;
  disabled?: boolean;
  readonly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  incrementLabel?: string;
  decrementLabel?: string;
  class?: string;
};

@Component({
  selector: "st-number-input",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class NumberInput {
  static readonly stComponentName = "NumberInput";
  readonly componentName = "NumberInput";
  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() size?: NumberInputSize;
  @NgInput() modelValue?: number | string;
  @NgInput() value?: number | string | null;
  @NgInput() disabled?: boolean;
  @NgInput() readonly?: boolean;
  @NgInput() min?: number | string;
  @NgInput() max?: number | string;
  @NgInput() step?: number | string;
  @NgInput() incrementLabel?: string;
  @NgInput() decrementLabel?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-numberInput", this.classInput].filter(Boolean).join(" ");
  }
}
