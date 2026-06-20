import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ToggletipPlacement = "top" | "bottom" | "start" | "end";

export type ToggletipProps = {
  label: unknown;
  content?: unknown;
  open?: boolean;
  placement?: ToggletipPlacement;
  class?: string;
};

@Component({
  selector: "st-toggletip",
  standalone: true,
  template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <button
        type="button"
        class="st-toggletip__trigger"
        [attr.aria-expanded]="localOpen"
        (click)="toggle()"
      >{{ label }}</button>
      @if (localOpen) {
        <span class="st-toggletip__bubble" role="status">
          <span class="st-toggletip__content">{{ content }}</span>
        </span>
      }
    </span>
  `,
})
export class Toggletip {
  static readonly stComponentName = "Toggletip";
  readonly componentName = "Toggletip";

  @NgInput() label!: unknown;
  @NgInput() content?: unknown;
  @NgInput() open?: boolean;
  @NgInput() placement?: ToggletipPlacement;
  @NgInput("class") classInput?: string;

  localOpen = false;

  get hostClass(): string {
    return classNames(
      "st-toggletip",
      `st-toggletip--${this.placement ?? "top"}`,
      this.classInput,
    );
  }

  toggle(): void {
    if (this.open !== undefined) return;
    this.localOpen = !this.localOpen;
  }
}
