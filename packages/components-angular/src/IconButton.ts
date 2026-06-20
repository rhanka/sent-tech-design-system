import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonVariant = "secondary" | "danger" | "ghost";

export type IconButtonProps = {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-icon-button",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class IconButton {
  static readonly stComponentName = "IconButton";
  readonly componentName = "IconButton";
  @NgInput() size?: IconButtonSize;
  @NgInput() variant?: IconButtonVariant;
  @NgInput("type") typeInput?: "button" | "submit" | "reset";
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-iconButton",
      this.size && `st-iconButton--${this.size}`,
      this.variant && `st-iconButton--${this.variant}`,
      this.classInput,
    );
  }
}
