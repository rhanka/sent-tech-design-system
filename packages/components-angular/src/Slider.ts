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
      <div class="st-slider__header">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        @if (showValueResolved) {
          <output class="st-slider__value" aria-live="polite">{{ formatted }}</output>
        }
      </div>
      <span [class]="groupClass">
        <span class="st-slider__bounds" aria-hidden="true">{{ resolvedMin }}</span>
        <span class="st-slider__track">
          <span class="st-slider__fill" [style]="fillStyle"></span>
          <span class="st-slider__thumb" [style.left]="percent + '%'" aria-hidden="true">
            @if (showValueResolved) {
              <span class="st-slider__tooltip">{{ formatted }}</span>
            }
          </span>
          <input
            type="range"
            class="st-slider__input"
            [attr.aria-label]="label"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            [value]="safeValue"
            [min]="resolvedMin"
            [max]="resolvedMax"
            [step]="resolvedStep"
            [disabled]="disabled ?? false"
            (input)="onInput($event)"
          />
        </span>
        <span class="st-slider__bounds" aria-hidden="true">{{ resolvedMax }}</span>
      </span>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
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
  @Output() readonly change = new EventEmitter<number>();

  get resolvedMin(): number {
    return this.min ?? 0;
  }

  get resolvedMax(): number {
    return this.max ?? 100;
  }

  get resolvedStep(): number {
    return this.step ?? 1;
  }

  // showValue defaults to true (Svelte default).
  get showValueResolved(): boolean {
    return this.showValue ?? true;
  }

  get rawValue(): number {
    return this.modelValue ?? this.value ?? this.resolvedMin;
  }

  get safeValue(): number {
    const v = this.rawValue;
    const min = this.resolvedMin;
    const max = this.resolvedMax;
    if (typeof v !== "number" || Number.isNaN(v)) return min;
    if (v < min) return min;
    if (v > max) return max;
    return v;
  }

  get percent(): number {
    const min = this.resolvedMin;
    const max = this.resolvedMax;
    if (max === min) return 0;
    return ((this.safeValue - min) / (max - min)) * 100;
  }

  get fillStyle(): string {
    return `--st-slider-fill: ${this.percent}%`;
  }

  get formatted(): string {
    return this.valueFormatter ? this.valueFormatter(this.safeValue) : String(this.safeValue);
  }

  get isInvalid(): boolean {
    return Boolean(this.invalid) || Boolean(this.errorText);
  }

  get groupClass(): string {
    return classNames("st-slider", `st-slider--${this.size ?? "md"}`);
  }

  get hostClass(): string {
    return classNames("st-field", this.classInput);
  }

  onInput(e: Event): void {
    const next = Number((e.target as HTMLInputElement).value);
    if (Number.isFinite(next)) {
      this.modelValueChange.emit(next);
      this.change.emit(next);
    }
  }
}
