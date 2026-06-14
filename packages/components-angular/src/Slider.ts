import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SliderSize = "sm" | "md" | "lg";

export type SliderProps = {
  label?: string;
  size?: SliderSize;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  modelValue?: number;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  class?: string;
};

@Component({
  selector: "st-slider",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Slider {
  static readonly stComponentName = "Slider";
  readonly componentName = "Slider";
  @NgInput() label?: string;
  @NgInput() size?: SliderSize;
  @NgInput() value?: number;
  @NgInput() defaultValue?: number;
  @NgInput() min?: number;
  @NgInput() max?: number;
  @NgInput() step?: number;
  @NgInput() modelValue?: number;
  @NgInput() helperText?: string;
  @NgInput() errorText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() showValue?: boolean;
  @NgInput() valueFormatter?: (value: number) => string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-slider", this.classInput].filter(Boolean).join(" ");
  }
}
