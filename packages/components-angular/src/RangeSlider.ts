import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type RangeSliderSize = "sm" | "md" | "lg";

export type RangeSliderProps = {
  modelValue?: [number, number];
  value?: [number, number];
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
      @if (label) {
        <label class="st-field__label">{{ label }}</label>
      }
      <div class="st-rangeSlider">
        <input
          type="range"
          class="st-rangeSlider__thumb st-rangeSlider__thumb--low"
          [min]="min ?? 0"
          [max]="high"
          [step]="step ?? 1"
          [value]="low"
          [disabled]="disabled ?? false"
          [attr.aria-label]="ariaLabelMin ?? 'Minimum value'"
          (input)="onLow($event)"
        />
        <input
          type="range"
          class="st-rangeSlider__thumb st-rangeSlider__thumb--high"
          [min]="low"
          [max]="max ?? 100"
          [step]="step ?? 1"
          [value]="high"
          [disabled]="disabled ?? false"
          [attr.aria-label]="ariaLabelMax ?? 'Maximum value'"
          (input)="onHigh($event)"
        />
      </div>
      @if (showValue) {
        <span class="st-rangeSlider__values">{{ formatValue(low) }} – {{ formatValue(high) }}</span>
      }
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      }
      @if (!errorText && helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
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

  @Output() readonly valueChange = new EventEmitter<[number, number]>();

  get currentValue(): [number, number] {
    return this.modelValue ?? this.value ?? [this.min ?? 0, this.max ?? 100];
  }

  get low(): number {
    return this.currentValue[0];
  }

  get high(): number {
    return this.currentValue[1];
  }

  get hostClass(): string {
    return classNames(
      "st-field",
      this.size ? `st-field--${this.size}` : undefined,
      this.invalid ? "st-field--invalid" : undefined,
      this.classInput,
    );
  }

  formatValue(n: number): string {
    return this.valueFormatter ? this.valueFormatter(n) : String(n);
  }

  onLow(e: Event): void {
    this.valueChange.emit([Number((e.target as HTMLInputElement).value), this.high]);
  }

  onHigh(e: Event): void {
    this.valueChange.emit([this.low, Number((e.target as HTMLInputElement).value)]);
  }
}
