import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type AlertTone = "info" | "success" | "warning" | "error";

export type AlertProps = {
  tone?: AlertTone;
  title: unknown;
  message?: unknown;
  actions?: unknown;
  class?: string;
};

@Component({
  selector: "st-alert",
  standalone: true,
  template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass" [attr.role]="role">
      <div class="st-alert__content">
        @if (title) {
          <h2 class="st-alert__title">{{ title }}</h2>
        }
        @if (message) {
          <p class="st-alert__message">{{ message }}</p>
        }
        <ng-content></ng-content>
      </div>
      @if (actions) {
        <div class="st-alert__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
      }
    </section>
  `,
})
export class Alert {
  static readonly stComponentName = "Alert";
  readonly componentName = "Alert";
  @NgInput() tone?: AlertTone;
  @NgInput() title!: unknown;
  @NgInput() message?: unknown;
  @NgInput() actions?: unknown;
  @NgInput("class") classInput?: string;

  get role(): string {
    const tone = this.tone ?? "info";
    return tone === "error" || tone === "warning" ? "alert" : "status";
  }

  get hostClass(): string {
    return classNames(
      "st-alert",
      `st-alert--${this.tone ?? "info"}`,
      this.classInput,
    );
  }
}
