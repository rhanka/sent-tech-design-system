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
      <ng-content></ng-content>
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

  get hostClass(): string {
    return ["st-progressBar", this.classInput].filter(Boolean).join(" ");
  }
}
