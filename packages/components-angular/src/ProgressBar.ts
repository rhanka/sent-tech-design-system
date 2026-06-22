import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ProgressBarTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export type ProgressBarSize = "sm" | "md" | "lg";

export type ProgressBarProps = {
  label?: unknown;
  helperText?: string;
  value?: number;
  max?: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  indeterminate?: boolean;
  showValue?: boolean;
  valueText?: string;
  class?: string;
};

@Component({
  selector: "st-progress-bar",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label || (showValue && !indeterminate)) {
        <div class="st-progressBar__header">
          @if (label) {
            <span class="st-progressBar__label">{{ label }}</span>
          }
          @if (showValue && !indeterminate) {
            <span class="st-progressBar__value" aria-hidden="true">{{ displayValue }}</span>
          }
        </div>
      }
      <div
        [class]="trackClass"
        role="progressbar"
        [attr.aria-valuemin]="indeterminate ? null : 0"
        [attr.aria-valuemax]="indeterminate ? null : resolvedMax"
        [attr.aria-valuenow]="indeterminate ? null : clampedValue"
        [attr.aria-valuetext]="indeterminate ? null : displayValue"
        [attr.aria-label]="label"
      >
        <div class="st-progressBar__fill" [style]="fillStyle"></div>
      </div>
      @if (helperText) {
        <span class="st-progressBar__help">{{ helperText }}</span>
      }
    </div>
  `,
})
export class ProgressBar {
  static readonly stComponentName = "ProgressBar";
  readonly componentName = "ProgressBar";
  @NgInput() label?: unknown;
  @NgInput() helperText?: string;
  @NgInput() value?: number;
  @NgInput() max?: number;
  @NgInput() tone?: ProgressBarTone;
  @NgInput() size?: ProgressBarSize;
  @NgInput() indeterminate?: boolean;
  @NgInput() showValue?: boolean;
  @NgInput() valueText?: string;
  @NgInput("class") classInput?: string;

  get resolvedMax(): number {
    return this.max ?? 100;
  }

  get resolvedTone(): ProgressBarTone {
    return this.tone ?? "neutral";
  }

  get resolvedSize(): ProgressBarSize {
    return this.size ?? "md";
  }

  get clampedValue(): number {
    const max = this.resolvedMax;
    const value = this.value ?? 0;
    if (max <= 0) return 0;
    if (value < 0) return 0;
    if (value > max) return max;
    return value;
  }

  get percent(): number {
    return this.indeterminate ? 0 : (this.clampedValue / this.resolvedMax) * 100;
  }

  get fillStyle(): string {
    return `--st-progressBar-pct: ${this.percent}%`;
  }

  get displayValue(): string {
    if (this.valueText) return this.valueText;
    if (this.indeterminate) return "";
    return `${Math.round(this.percent)}%`;
  }

  get trackClass(): string {
    return classNames(
      "st-progressBar__track",
      `st-progressBar__track--${this.resolvedSize}`,
      `st-progressBar__track--${this.resolvedTone}`,
      this.indeterminate && "st-progressBar__track--indeterminate",
    );
  }

  get hostClass(): string {
    return classNames("st-progressBar", this.classInput);
  }
}
