import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export type ModalProps = {
  open?: boolean;
  title?: string;
  description?: string;
  size?: ModalSize;
  class?: string;
  closeLabel?: string;
  dismissible?: boolean;
  zIndex?: number;
};

@Component({
  selector: "st-modal",
  standalone: true,
  template: `
    @if (open) {
      <div
        class="st-modal__backdrop"
        role="presentation"
        [style.z-index]="zIndex != null ? zIndex : null"
        (click)="onBackdropClick($event)"
      >
        <section
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || 'Modal'"
          tabindex="-1"
        >
          <header class="st-modal__header">
            <div>
              @if (title) {
                <h2 class="st-modal__title">{{ title }}</h2>
              }
              @if (description) {
                <p class="st-modal__description">{{ description }}</p>
              }
            </div>
            <button
              type="button"
              class="st-modal__close"
              [attr.aria-label]="closeLabel || 'Close'"
              (click)="close.emit()"
            >&#x2715;</button>
          </header>
          <div class="st-modal__body">
            <ng-content></ng-content>
          </div>
          <footer class="st-modal__footer">
            <ng-content select="[slot='footer']"></ng-content>
          </footer>
        </section>
      </div>
    }
  `,
})
export class Modal {
  static readonly stComponentName = "Modal";
  readonly componentName = "Modal";

  @NgInput() open?: boolean;
  @NgInput() title?: string;
  @NgInput() description?: string;
  @NgInput() size?: ModalSize;
  @NgInput() closeLabel?: string;
  @NgInput() dismissible?: boolean;
  @NgInput() zIndex?: number;
  @NgInput("class") classInput?: string;

  @Output() readonly close = new EventEmitter<void>();

  get hostClass(): string {
    return classNames(
      "st-modal",
      this.size && `st-modal--${this.size}`,
      this.classInput,
    );
  }

  onBackdropClick(event: MouseEvent): void {
    const dismissible = this.dismissible ?? true;
    if (dismissible && event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
