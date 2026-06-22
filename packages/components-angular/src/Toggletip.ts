import { Component, EventEmitter, HostListener, Input as NgInput, Output } from "@angular/core";
import type { OnChanges, SimpleChanges } from "@angular/core";

import { classNames } from "./classNames.js";

export type ToggletipPlacement = "top" | "bottom" | "start" | "end";

export type ToggletipProps = {
  content: unknown;
  label?: string;
  open?: boolean;
  placement?: ToggletipPlacement;
  triggerLabel?: string;
  class?: string;
};

@Component({
  selector: "st-toggletip",
  standalone: true,
  template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
      <button
        type="button"
        class="st-toggletip__trigger"
        [attr.aria-label]="triggerLabel ?? label ?? 'More information'"
        [attr.aria-expanded]="isOpen ? 'true' : 'false'"
        (click)="toggle()"
      >
        <span aria-hidden="true">i</span>
      </button>
      @if (isOpen) {
        <span class="st-toggletip__bubble" role="status" aria-live="polite">
          @if (label) {
            <span class="st-toggletip__label">{{ label }}</span>
          }
          <span class="st-toggletip__content">{{ content }}</span>
        </span>
      }
    </span>
  `,
})
export class Toggletip implements OnChanges {
  static readonly stComponentName = "Toggletip";
  readonly componentName = "Toggletip";

  @NgInput() content!: unknown;
  @NgInput() label?: string;
  @NgInput() open?: boolean;
  @NgInput() placement?: ToggletipPlacement;
  @NgInput() triggerLabel?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly openChange = new EventEmitter<boolean>();

  isOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["open"] && this.open !== undefined) {
      this.isOpen = this.open;
    }
  }

  get hostClass(): string {
    return classNames(
      "st-toggletip",
      `st-toggletip--${this.placement ?? "top"}`,
      this.classInput,
    );
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.openChange.emit(this.isOpen);
  }

  close(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.openChange.emit(false);
    }
  }

  @HostListener("document:keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.isOpen) {
      event.preventDefault();
      this.close();
    }
  }
}
