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
};

@Component({
  selector: "st-modal",
  standalone: true,
  template: `
    @if (open) {
      <div class="st-modal__backdrop">
        <section
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || 'Modal'"
        >
          <div class="st-modal__header">
            @if (title) {
              <h2 class="st-modal__title">{{ title }}</h2>
            }
            <button
              type="button"
              class="st-modal__close"
              [attr.aria-label]="closeLabel || 'Close'"
              (click)="close.emit()"
            >&#x2715;</button>
          </div>
          @if (description) {
            <p class="st-modal__description">{{ description }}</p>
          }
          <div class="st-modal__body">
            <ng-content></ng-content>
          </div>
          <div class="st-modal__footer">
            <ng-content select="[slot='footer']"></ng-content>
          </div>
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
  @NgInput("class") classInput?: string;

  @Output() readonly close = new EventEmitter<void>();

  get hostClass(): string {
    return classNames(
      "st-modal",
      this.size && `st-modal--${this.size}`,
      this.classInput,
    );
  }
}
