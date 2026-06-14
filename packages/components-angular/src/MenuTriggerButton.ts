import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

// `expanded` (Svelte-canonical) is accepted as an alias of `open`.
export type MenuTriggerButtonSize = "sm" | "md" | "lg";

export type MenuTriggerButtonVariant = "ghost" | "secondary";

export type MenuTriggerButtonProps = {
  open?: boolean;
  expanded?: boolean;
  size?: MenuTriggerButtonSize;
  variant?: MenuTriggerButtonVariant;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-menu-trigger-button",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class MenuTriggerButton {
  static readonly stComponentName = "MenuTriggerButton";
  readonly componentName = "MenuTriggerButton";
  @NgInput() open?: boolean;
  @NgInput() expanded?: boolean;
  @NgInput() size?: MenuTriggerButtonSize;
  @NgInput() variant?: MenuTriggerButtonVariant;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-menuTriggerButton", this.classInput].filter(Boolean).join(" ");
  }
}
