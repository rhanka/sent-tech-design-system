import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type RangeSliderSize = "sm" | "md" | "lg";

export type RangeSliderProps = {
  /** Valeur contrôlée via v-model [poignée basse, poignée haute]. */
  modelValue?: [number, number];
  /** Alias contrôlé sans v-model. */
  value?: [number, number];
  /** Valeur initiale en mode non-contrôlé. Défaut [min, max]. */
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  size?: RangeSliderSize;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  ariaLabelMin?: string;
  ariaLabelMax?: string;
  class?: string;
};

@Component({
  selector: "st-range-slider",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class RangeSlider {
  static readonly stComponentName = "RangeSlider";
  readonly componentName = "RangeSlider";
  @NgInput() modelValue?: [number, number];
  @NgInput() value?: [number, number];
  @NgInput() defaultValue?: [number, number];
  @NgInput() min?: number;
  @NgInput() max?: number;
  @NgInput() step?: number;
  @NgInput() size?: RangeSliderSize;
  @NgInput() disabled?: boolean;
  @NgInput() label?: string;
  @NgInput() helperText?: string;
  @NgInput() errorText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() showValue?: boolean;
  @NgInput() valueFormatter?: (value: number) => string;
  @NgInput() ariaLabelMin?: string;
  @NgInput() ariaLabelMax?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-rangeSlider", this.classInput].filter(Boolean).join(" ");
  }
}
