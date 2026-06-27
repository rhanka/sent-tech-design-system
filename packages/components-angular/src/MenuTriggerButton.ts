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
    <button
      type="button"
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      aria-haspopup="menu"
      [attr.aria-expanded]="isOpen"
      [disabled]="disabled ?? false"
    >
      <ng-content>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m16 10-4 4-4-4"></path>
        </svg>
      </ng-content>
    </button>
  `,
})
export class MenuTriggerButton {
  static readonly stComponentName = "MenuTriggerButton";
  readonly componentName = "MenuTriggerButton";
  @NgInput() open?: boolean;
  @NgInput() expanded?: boolean;
  @NgInput() size: MenuTriggerButtonSize = "md";
  @NgInput() variant: MenuTriggerButtonVariant = "ghost";
  @NgInput() disabled = false;
  @NgInput("class") classInput?: string;

  get isOpen(): boolean {
    return this.open ?? this.expanded ?? false;
  }

  get hostClass(): string {
    return classNames(
      `st-iconButton st-iconButton--${this.size} st-iconButton--${this.variant}`,
      this.classInput,
    );
  }
}
