import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

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
  disabled?: boolean;
  valueFormatter?: (value: number) => string;
  class?: string;
};

@Component({
  selector: "st-slider",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label">
          {{ label }}
          @if (showValue) {
            : {{ currentValue }}
          }
        </label>
      }
      <input
        type="range"
        class="st-slider"
        [min]="min ?? 0"
        [max]="max ?? 100"
        [step]="step ?? 1"
        [value]="currentValue"
        [disabled]="disabled ?? false"
        (input)="onInput($event)"
      />
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
  @NgInput() disabled?: boolean;
  @NgInput() valueFormatter?: (value: number) => string;
  @NgInput("class") classInput?: string;

  @Output() readonly modelValueChange = new EventEmitter<number>();

  get currentValue(): number {
    return this.modelValue ?? this.value ?? this.min ?? 0;
  }

  get hostClass(): string {
    return classNames(
      "st-field",
      this.size ? `st-field--${this.size}` : undefined,
      this.invalid ? "st-field--invalid" : undefined,
      this.classInput,
    );
  }

  onInput(e: Event): void {
    this.modelValueChange.emit(Number((e.target as HTMLInputElement).value));
  }
}
