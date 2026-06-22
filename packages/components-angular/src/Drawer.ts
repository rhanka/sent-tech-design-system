import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type DrawerSide = "left" | "right" | "bottom";

/** @deprecated Use {@link DrawerSide}. Kept for backward compatibility. */
export type DrawerPlacement = DrawerSide;

export type DrawerProps = {
  open?: boolean;
  title?: string;
  description?: string;
  side?: DrawerSide;
  closeLabel?: string;
  class?: string;
};

@Component({
  selector: "st-drawer",
  standalone: true,
  template: `
    @if (open) {
      <div
        class="st-drawer__backdrop"
        data-testid="st-drawer-backdrop"
        role="presentation"
        (click)="onBackdropClick($event)"
      >
        <aside
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || 'Drawer'"
        >
          <header class="st-drawer__header">
            <div>
              @if (title) {
                <h2 class="st-drawer__title">{{ title }}</h2>
              }
              @if (description) {
                <p class="st-drawer__description">{{ description }}</p>
              }
            </div>
            <button
              type="button"
              class="st-drawer__close"
              [attr.aria-label]="closeLabel || 'Close'"
              (click)="close.emit()"
            ><span aria-hidden="true">&#x2715;</span></button>
          </header>
          <div class="st-drawer__body">
            <ng-content></ng-content>
          </div>
          @if (footer != null) {
            <footer class="st-drawer__footer">
              <ng-content select="[slot='footer']"></ng-content>
            </footer>
          }
        </aside>
      </div>
    }
  `,
})
export class Drawer {
  static readonly stComponentName = "Drawer";
  readonly componentName = "Drawer";

  @NgInput() open?: boolean;
  @NgInput() title?: string;
  @NgInput() description?: string;
  @NgInput() side?: DrawerSide;
  @NgInput() closeLabel?: string;
  @NgInput() footer?: unknown;
  @NgInput("class") classInput?: string;

  @Output() readonly close = new EventEmitter<void>();

  get hostClass(): string {
    return classNames(
      "st-drawer",
      `st-drawer--${this.side ?? "right"}`,
      this.classInput,
    );
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
