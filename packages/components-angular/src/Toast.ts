import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ToastTone = "info" | "success" | "warning" | "error";

export type ToastProps = {
  tone?: ToastTone;
  title: unknown;
  message?: unknown;
  actions?: unknown;
  class?: string;
};

@Component({
  selector: "st-toast",
  standalone: true,
  template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role"
    >
      <div class="st-toast__content">
        <h2 class="st-toast__title">{{ title }}</h2>
        @if (message) {
          <p class="st-toast__message">{{ message }}</p>
        }
      </div>
      @if (actions) {
        <div class="st-toast__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
      }
    </section>
  `,
})
export class Toast {
  static readonly stComponentName = "Toast";
  readonly componentName = "Toast";

  @NgInput() tone?: ToastTone;
  @NgInput() title!: unknown;
  @NgInput() message?: unknown;
  @NgInput() actions?: unknown;
  @NgInput("class") classInput?: string;

  get role(): "alert" | "status" {
    return this.tone === "error" ? "alert" : "status";
  }

  get hostClass(): string {
    return classNames(
      "st-toast",
      `st-toast--${this.tone ?? "info"}`,
      this.classInput,
    );
  }
}
