import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonVariant = "secondary" | "danger" | "ghost";

export type IconButtonProps = {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
  class?: string;
};

@Component({
  selector: "st-icon-button",
  standalone: true,
  template: `
    <button
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [type]="typeInput ?? 'button'"
      [disabled]="disabled ?? false"
      [attr.aria-label]="ariaLabel ?? null"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class IconButton {
  static readonly stComponentName = "IconButton";
  readonly componentName = "IconButton";
  @NgInput() size: IconButtonSize = "md";
  @NgInput() variant: IconButtonVariant = "ghost";
  @NgInput("type") typeInput?: "button" | "submit" | "reset";
  @NgInput() disabled?: boolean;
  @NgInput("aria-label") ariaLabel?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-iconButton",
      `st-iconButton--${this.size}`,
      `st-iconButton--${this.variant}`,
      this.classInput,
    );
  }
}
