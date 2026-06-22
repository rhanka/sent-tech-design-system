import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type PopoverPlacement = "top" | "right" | "bottom" | "left";

export type PopoverOpenOn = "manual" | "hover";

export type PopoverProps = {
  content?: string;
  label?: string;
  triggerLabel?: string;
  open?: boolean;
  placement?: PopoverPlacement;
  openOn?: PopoverOpenOn;
  class?: string;
};

@Component({
  selector: "st-popover",
  standalone: true,
  template: `
    <span
      [attr.data-st-component]="componentName"
      class="st-popover-host"
      (mouseenter)="onHover(true)"
      (mouseleave)="onHover(false)"
      (focusin)="onHover(true)"
      (focusout)="onHover(false)"
      (click)="onHostClick()"
    >
      <ng-content select="[slot='trigger']"></ng-content>
      @if (triggerLabel) {
        <button type="button" class="st-popover__trigger">{{ triggerLabel }}</button>
      }
      @if (isOpen) {
        <section
          [class]="popoverClass"
          role="dialog"
          [attr.aria-label]="label || content || 'Popover'"
        >
          <ng-content></ng-content>
          {{ content }}
        </section>
      }
    </span>
  `,
})
export class Popover {
  static readonly stComponentName = "Popover";
  readonly componentName = "Popover";

  @NgInput() content?: string;
  @NgInput() label?: string;
  @NgInput() triggerLabel?: string;
  @NgInput() open?: boolean;
  @NgInput() placement?: PopoverPlacement;
  @NgInput() openOn?: PopoverOpenOn;
  @NgInput("class") classInput?: string;

  @Output() readonly close = new EventEmitter<void>();

  localOpen = false;
  hovered = false;

  get isOpen(): boolean {
    if (this.open !== undefined) return this.open;
    if (this.openOn === "hover") return this.hovered;
    return this.localOpen;
  }

  get popoverClass(): string {
    return classNames("st-popover", `st-popover--${this.placement ?? "bottom"}`);
  }

  onHover(value: boolean): void {
    this.hovered = value;
  }

  onHostClick(): void {
    if (this.open === undefined && this.openOn !== "hover") {
      this.localOpen = !this.localOpen;
    }
  }
}
