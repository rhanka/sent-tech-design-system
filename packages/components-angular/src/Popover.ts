import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type PopoverPlacement = "top" | "right" | "bottom" | "left";

export type PopoverProps = {
  content?: string;
  label?: string;
  open?: boolean;
  placement?: PopoverPlacement;
  class?: string;
};

@Component({
  selector: "st-popover",
  standalone: true,
  template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      (click)="localOpen = true"
    >
      <ng-content></ng-content>
      @if (isOpen) {
        <section
          [class]="popoverClass"
          role="dialog"
          [attr.aria-label]="label || content || 'Popover'"
        >{{ content }}</section>
      }
    </span>
  `,
})
export class Popover {
  static readonly stComponentName = "Popover";
  readonly componentName = "Popover";

  @NgInput() content?: string;
  @NgInput() label?: string;
  @NgInput() open?: boolean;
  @NgInput() placement?: PopoverPlacement;
  @NgInput("class") classInput?: string;

  @Output() readonly close = new EventEmitter<void>();

  localOpen = false;

  get isOpen(): boolean {
    return this.open !== undefined ? this.open : this.localOpen;
  }

  get hostClass(): string {
    return classNames("st-popover-host", this.classInput);
  }

  get popoverClass(): string {
    return classNames("st-popover", `st-popover--${this.placement ?? "bottom"}`);
  }
}
