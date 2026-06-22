import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-button",
  standalone: true,
  template: `
    <button
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [type]="typeInput ?? 'button'"
      [disabled]="disabled ?? false"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class Button {
  static readonly stComponentName = "Button";
  readonly componentName = "Button";
  @NgInput() variant?: ButtonVariant;
  @NgInput() size?: ButtonSize;
  @NgInput("type") typeInput?: "button" | "submit" | "reset";
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-button",
      `st-button--${this.variant ?? "primary"}`,
      `st-button--${this.size ?? "md"}`,
      this.classInput,
    );
  }
}
