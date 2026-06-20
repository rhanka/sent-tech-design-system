import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type ToastTone = "info" | "success" | "warning" | "error";

export type ToastItem = {
  id: string;
  tone?: ToastTone;
  title: unknown;
  message?: unknown;
  actions?: unknown;
};

export type ToastProps = {
  tone?: ToastTone;
  title?: unknown;
  message?: unknown;
  items?: ToastItem[];
  autoDismiss?: boolean;
  duration?: number;
  class?: string;
  closeLabel?: string;
};

@Component({
  selector: "st-toast",
  standalone: true,
  template: `
    @if (open) {
      <section
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [attr.role]="tone === 'error' ? 'alert' : 'status'"
      >
        <div class="st-toast__content">
          @if (title) {
            <h2 class="st-toast__title">{{ title }}</h2>
          }
          @if (message) {
            <p class="st-toast__message">{{ message }}</p>
          }
          @if (!message) {
            <ng-content></ng-content>
          }
        </div>
        <div class="st-toast__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
        <button
          type="button"
          class="st-toast__close"
          (click)="close.emit()"
        >{{ closeLabel || 'Close' }}</button>
      </section>
    }
  `,
})
export class Toast {
  static readonly stComponentName = "Toast";
  readonly componentName = "Toast";

  @NgInput() open = false;
  @NgInput() tone?: ToastTone;
  @NgInput() title?: unknown;
  @NgInput() message?: unknown;
  @NgInput() items?: ToastItem[];
  @NgInput() autoDismiss?: boolean;
  @NgInput() duration?: number;
  @NgInput() closeLabel?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly close = new EventEmitter<void>();

  get hostClass(): string {
    return classNames(
      "st-toast",
      `st-toast--${this.tone ?? "info"}`,
      this.classInput,
    );
  }
}
