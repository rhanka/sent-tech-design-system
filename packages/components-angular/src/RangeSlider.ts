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
      <div class="st-rangeSlider__header">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        @if (showValue) {
          <output class="st-rangeSlider__value" aria-live="polite">{{ formatValue(low) }} – {{ formatValue(high) }}</output>
        }
      </div>
      <span [class]="groupClass">
        <span class="st-rangeSlider__bounds" aria-hidden="true">{{ resolvedMin }}</span>
        <span class="st-rangeSlider__track" [attr.aria-invalid]="isInvalid ? 'true' : null">
          <span
            class="st-rangeSlider__fill"
            [style.left.%]="lowPercent"
            [style.width.%]="fillWidth"
          ></span>
          <span
            class="st-rangeSlider__thumb st-rangeSlider__thumb--low"
            [style.left.%]="lowPercent"
            role="slider"
            [attr.tabindex]="disabled ? -1 : 0"
            [attr.aria-label]="ariaLabelMin ?? 'Valeur minimale'"
            [attr.aria-valuemin]="resolvedMin"
            [attr.aria-valuemax]="high"
            [attr.aria-valuenow]="low"
            [attr.aria-valuetext]="formatValue(low)"
            [attr.aria-disabled]="disabled ? 'true' : null"
            (keydown)="onLowKeydown($event)"
          >
            @if (showValue) {
              <span class="st-rangeSlider__tooltip">{{ formatValue(low) }}</span>
            }
          </span>
          <span
            class="st-rangeSlider__thumb st-rangeSlider__thumb--high"
            [style.left.%]="highPercent"
            role="slider"
            [attr.tabindex]="disabled ? -1 : 0"
            [attr.aria-label]="ariaLabelMax ?? 'Valeur maximale'"
            [attr.aria-valuemin]="low"
            [attr.aria-valuemax]="resolvedMax"
            [attr.aria-valuenow]="high"
            [attr.aria-valuetext]="formatValue(high)"
            [attr.aria-disabled]="disabled ? 'true' : null"
            (keydown)="onHighKeydown($event)"
          >
            @if (showValue) {
              <span class="st-rangeSlider__tooltip">{{ formatValue(high) }}</span>
            }
          </span>
        </span>
        <span class="st-rangeSlider__bounds" aria-hidden="true">{{ resolvedMax }}</span>
      </span>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
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

  get resolvedMin(): number {
    return this.min ?? 0;
  }

  get resolvedMax(): number {
    return this.max ?? 100;
  }

  get resolvedStep(): number {
    return this.step ?? 1;
  }

  get currentValue(): [number, number] {
    return (
      this.modelValue ??
      this.value ??
      this.defaultValue ?? [this.resolvedMin, this.resolvedMax]
    );
  }

  get low(): number {
    return this.currentValue[0];
  }

  get high(): number {
    return this.currentValue[1];
  }

  get lowPercent(): number {
    const span = this.resolvedMax - this.resolvedMin;
    return span === 0 ? 0 : ((this.low - this.resolvedMin) / span) * 100;
  }

  get highPercent(): number {
    const span = this.resolvedMax - this.resolvedMin;
    return span === 0 ? 0 : ((this.high - this.resolvedMin) / span) * 100;
  }

  get fillWidth(): number {
    return Math.max(0, this.highPercent - this.lowPercent);
  }

  get isInvalid(): boolean {
    return Boolean(this.invalid) || Boolean(this.errorText);
  }

  get hostClass(): string {
    return classNames("st-field", this.classInput);
  }

  get groupClass(): string {
    return classNames(
      "st-rangeSlider",
      `st-rangeSlider--${this.size ?? "md"}`,
      this.disabled && "st-rangeSlider--disabled",
    );
  }

  formatValue(n: number): string {
    return this.valueFormatter ? this.valueFormatter(n) : String(n);
  }

  private clampStep(n: number): number {
    if (!Number.isFinite(n)) return this.resolvedMin;
    let v = Math.min(Math.max(n, this.resolvedMin), this.resolvedMax);
    const step = this.resolvedStep;
    if (Number.isFinite(step) && step > 0) {
      v = this.resolvedMin + Math.round((v - this.resolvedMin) / step) * step;
      v = Math.min(Math.max(v, this.resolvedMin), this.resolvedMax);
    }
    return v;
  }

  private setLow(raw: number): void {
    if (this.disabled) return;
    const lo = Math.min(this.clampStep(raw), this.high);
    this.valueChange.emit([lo, this.high]);
  }

  private setHigh(raw: number): void {
    if (this.disabled) return;
    const hi = Math.max(this.clampStep(raw), this.low);
    this.valueChange.emit([this.low, hi]);
  }

  private keyDelta(event: KeyboardEvent, value: number): number | null {
    const step = Number.isFinite(this.resolvedStep) && this.resolvedStep > 0 ? this.resolvedStep : 1;
    const big = step * 10;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        return value + step;
      case "ArrowLeft":
      case "ArrowDown":
        return value - step;
      case "PageUp":
        return value + big;
      case "PageDown":
        return value - big;
      case "Home":
        return this.resolvedMin;
      case "End":
        return this.resolvedMax;
      default:
        return null;
    }
  }

  onLowKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;
    const next = this.keyDelta(event, this.low);
    if (next === null) return;
    event.preventDefault();
    this.setLow(next);
  }

  onHighKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;
    const next = this.keyDelta(event, this.high);
    if (next === null) return;
    event.preventDefault();
    this.setHigh(next);
  }
}
